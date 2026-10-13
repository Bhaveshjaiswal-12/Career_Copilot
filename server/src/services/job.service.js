/**
 * Job Discovery Service
 * Integrates with permitted job data providers (Arbeitnow & Remotive),
 * applies multi-tier location resolution, provides English-first presentation
 * via cached Gemini translations, categorizes remote work scopes,
 * and computes personalized match scores against candidate profiles & resumes.
 */

import { batchTranslateJobs } from './translation.service.js';
import { resolveTargetCountry, normalizeCountry } from './location.service.js';

// In-memory cache for external job queries with 10-minute TTL
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCacheKey(provider, page) {
  return `${provider}:${page}`;
}

function getFromCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return cached.data;
}

function setInCache(key, data) {
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Fetch jobs from Arbeitnow public authorized API
 */
async function fetchArbeitnowJobs(page = 1) {
  const cacheKey = getCacheKey('arbeitnow', page);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const url = `https://www.arbeitnow.com/api/job-board-api?page=${page}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'CareerCopilot/2.0 (Job Matching)',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Arbeitnow API returned HTTP ${res.status}`);
    }

    const json = await res.json();
    const rawJobs = json.data || [];

    const normalized = rawJobs.map((item) => {
      const isRemote = Boolean(item.remote);
      let remoteScope = 'on-site';
      if (isRemote) {
        // Arbeitnow remote roles default to Europe / Germany unless location states worldwide
        const locLower = (item.location || '').toLowerCase();
        if (locLower.includes('worldwide') || locLower.includes('anywhere') || locLower.includes('global')) {
          remoteScope = 'worldwide';
        } else {
          remoteScope = 'regional'; // remote within EU/Germany
        }
      }

      return {
        id: item.slug || `arbeitnow-${Math.random().toString(36).substring(2, 9)}`,
        title: item.title || 'Untitled Role',
        company: item.company_name || 'Hiring Company',
        location: item.location || (isRemote ? 'Remote (Europe/Germany)' : 'Germany'),
        remote: isRemote,
        remoteScope,
        employmentType: 'full-time',
        url: item.url,
        description: item.description
          ? item.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
          : '',
        tags: Array.isArray(item.tags) ? item.tags : [],
        postedAt: item.created_at ? new Date(item.created_at * 1000).toISOString() : new Date().toISOString(),
        source: 'Arbeitnow',
        salary: '', // Arbeitnow does not consistently supply salary figures
        country: 'Germany',
      };
    });

    const result = {
      jobs: normalized,
      hasMore: Boolean(json.links?.next),
      page,
    };

    setInCache(cacheKey, result);
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Job provider request timed out. Please try again.');
    }
    throw err;
  }
}

/**
 * Fetch remote jobs from Remotive authorized public API
 * Remotive provides global tech jobs and allows filtering for worldwide and India candidates
 */
async function fetchRemotiveJobs() {
  const cacheKey = getCacheKey('remotive', 1);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const url = 'https://remotive.com/api/remote-jobs';
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'CareerCopilot/2.0 (Job Matching)',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Remotive API returned HTTP ${res.status}`);
    }

    const json = await res.json();
    const rawJobs = json.jobs || [];

    const normalized = rawJobs.map((item) => {
      const locStr = item.candidate_required_location || 'Worldwide';
      const locLower = locStr.toLowerCase();

      let remoteScope = 'regional';
      if (locLower.includes('worldwide') || locLower.includes('anywhere') || locLower.includes('global')) {
        remoteScope = 'worldwide';
      } else if (locLower.includes('india')) {
        remoteScope = 'india';
      }

      return {
        id: `remotive-${item.id}`,
        title: item.title || 'Untitled Role',
        company: item.company_name || 'Hiring Company',
        location: locStr ? `Remote (${locStr})` : 'Remote (Worldwide)',
        remote: true,
        remoteScope,
        employmentType: item.job_type ? item.job_type.replace('_', '-') : 'full-time',
        url: item.url,
        description: item.description
          ? item.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
          : '',
        tags: Array.isArray(item.tags) ? item.tags : [item.category].filter(Boolean),
        postedAt: item.publication_date ? new Date(item.publication_date).toISOString() : new Date().toISOString(),
        source: 'Remotive',
        salary: item.salary || '',
        country: locLower.includes('india') ? 'India' : 'Worldwide',
      };
    });

    const result = {
      jobs: normalized,
      hasMore: false,
      page: 1,
    };

    setInCache(cacheKey, result);
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[Remotive API] Could not fetch Remotive jobs:', err.message);
    return { jobs: [], hasMore: false, page: 1 };
  }
}

/**
 * Score a job against candidate profile / resume
 * Considers skills, experience level, target role, education, location and work mode.
 */
export function calculateJobMatch(job, userProfile = {}, targetCountryCode = 'IN') {
  const userSkills = (userProfile.skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  const preferredRole = (userProfile.preferredRole || '').toLowerCase().trim();
  const userWorkMode = (userProfile.workMode || 'any').toLowerCase();
  const expLevel = (userProfile.experienceLevel || 'any').toLowerCase();

  const jobTags = (job.tags || []).map((t) => t.toLowerCase().trim());
  const jobTitle = (job.title || '').toLowerCase();
  const jobDesc = (job.description || '').toLowerCase();

  const matchingSkills = [];
  const missingSkills = [];

  // Match skills against tags or description
  jobTags.forEach((tag) => {
    const isMatched = userSkills.some((skill) => tag.includes(skill) || skill.includes(tag));
    if (isMatched) {
      if (!matchingSkills.includes(tag)) matchingSkills.push(tag);
    } else {
      if (!missingSkills.includes(tag)) missingSkills.push(tag);
    }
  });

  // Check additional user skills mentioned in job description
  userSkills.forEach((skill) => {
    if (skill.length > 2 && jobDesc.includes(skill)) {
      if (!matchingSkills.includes(skill)) matchingSkills.push(skill);
    }
  });

  // Base score
  let score = 20;

  // 1. Skill match (up to 40 points)
  if (userSkills.length > 0) {
    const totalConsideredSkills = Math.max(1, matchingSkills.length + Math.min(4, missingSkills.length));
    const skillRatio = matchingSkills.length / totalConsideredSkills;
    score += Math.round(skillRatio * 40);
  }

  // 2. Role title alignment (up to 20 points)
  if (preferredRole && jobTitle.includes(preferredRole)) {
    score += 20;
  } else if (preferredRole && preferredRole.split(' ').some((word) => word.length > 3 && jobTitle.includes(word))) {
    score += 10;
  }

  // 3. Work mode preference alignment (up to 10 points)
  if (userWorkMode === 'remote' && job.remote) {
    score += 10;
  } else if (userWorkMode === 'on-site' && !job.remote) {
    score += 10;
  } else if (userWorkMode === 'any') {
    score += 7;
  }

  // 4. Location relevance (up to 15 points)
  // Country relevance applied before/during ranking
  if (targetCountryCode === 'IN') {
    if (job.remoteScope === 'india' || (job.location && job.location.toLowerCase().includes('india'))) {
      score += 15;
    } else if (job.remoteScope === 'worldwide') {
      score += 12;
    } else if (job.remote) {
      score += 5; // remote in another country
    } else {
      score += 0; // on-site in Germany/EU when target is India
    }
  } else if (targetCountryCode === 'DE') {
    if (job.country === 'Germany' || (job.location && job.location.toLowerCase().includes('germany'))) {
      score += 15;
    } else if (job.remoteScope === 'worldwide') {
      score += 10;
    }
  } else {
    // For other target countries
    if (job.remoteScope === 'worldwide') {
      score += 15;
    } else {
      score += 5;
    }
  }

  // 5. Experience level alignment (up to 5 points)
  if (expLevel !== 'any') {
    const isSeniorJob = jobTitle.includes('senior') || jobTitle.includes('lead') || jobTitle.includes('principal');
    const isJuniorJob = jobTitle.includes('junior') || jobTitle.includes('intern') || jobTitle.includes('entry') || jobTitle.includes('graduate');

    if ((expLevel === 'senior' || expLevel === 'lead') && isSeniorJob) {
      score += 5;
    } else if ((expLevel === 'entry' || expLevel === 'internship') && isJuniorJob) {
      score += 5;
    } else if (expLevel === 'mid' && !isSeniorJob && !isJuniorJob) {
      score += 5;
    }
  }

  // Clamp 10 - 98 (transparent heuristic match score)
  score = Math.min(98, Math.max(10, score));

  // Construct short personalized explanation
  let matchReason = '';
  if (matchingSkills.length > 0) {
    const sample = matchingSkills.slice(0, 3).join(', ');
    matchReason = `Matches skills: ${sample}.`;
    if (preferredRole && jobTitle.includes(preferredRole)) {
      matchReason += ` Closely aligns with your target role "${userProfile.preferredRole}".`;
    }
  } else if (preferredRole && jobTitle.includes(preferredRole)) {
    matchReason = `Direct role title match for "${userProfile.preferredRole}".`;
  } else {
    matchReason = 'General alignment based on industry requirements and engineering background.';
  }

  return {
    matchScore: score,
    matchingSkills,
    missingSkills: missingSkills.slice(0, 6),
    matchReason,
  };
}

/**
 * Main Job Search Function with location resolution, provider filtering,
 * English-first translation, and personalized ranking.
 */
export async function searchJobs({
  query = '',
  location = '',
  country = '',
  remote = 'all', // 'all', 'true', 'false'
  sortBy = 'match', // 'match' or 'recent'
  page = 1,
  limit = 20,
  userProfile = null,
  resumeData = null,
}) {
  // 1. Resolve Target Search Country using the 4-tier hierarchy
  const resolvedCountry = resolveTargetCountry({
    queryCountry: country,
    userProfile,
    resumeData,
  });

  // 2. Fetch jobs from permitted providers in parallel
  const [arbeitnowData, remotiveData] = await Promise.all([
    fetchArbeitnowJobs(page).catch((err) => {
      console.error('[Job Search] Arbeitnow fetch failed:', err.message);
      return { jobs: [], hasMore: false, page };
    }),
    fetchRemotiveJobs().catch((err) => {
      console.error('[Job Search] Remotive fetch failed:', err.message);
      return { jobs: [], hasMore: false, page: 1 };
    }),
  ]);

  // Combine jobs from providers
  let allRawJobs = [...remotiveData.jobs, ...arbeitnowData.jobs];

  // If no jobs could be fetched at all, throw clear error
  if (allRawJobs.length === 0) {
    throw new Error('Unable to fetch live job listings from external providers. Please try again.');
  }

  let filtered = allRawJobs;

  // 3. Country / Location Filtering
  // If target country is India ('IN'), prioritize jobs available to India:
  // - Remotive jobs where location includes 'India' or 'Worldwide'
  // - Arbeitnow jobs that are remote worldwide or user specifically searched
  if (resolvedCountry.code === 'IN') {
    // When India is selected and user hasn't explicitly specified another location query:
    if (!location || !location.trim()) {
      // Prioritize India-accessible jobs: Worldwide remote or India-based
      const indiaAccessible = filtered.filter(
        (j) =>
          j.remoteScope === 'worldwide' ||
          j.remoteScope === 'india' ||
          (j.location && j.location.toLowerCase().includes('india'))
      );
      // If we have India-accessible jobs, show them first, then allow other remote tech jobs
      if (indiaAccessible.length > 0) {
        const otherRemotes = filtered.filter(
          (j) => j.remote && !indiaAccessible.includes(j)
        );
        filtered = [...indiaAccessible, ...otherRemotes];
      }
    }
  } else if (resolvedCountry.code === 'DE') {
    // Germany target: filter/prioritize Germany-based and worldwide jobs
    filtered = filtered.filter(
      (j) =>
        j.country === 'Germany' ||
        (j.location && j.location.toLowerCase().includes('germany')) ||
        j.remoteScope === 'worldwide'
    );
  } else if (resolvedCountry.code !== 'ALL') {
    // Specific country filter (e.g. US, UK)
    const cName = resolvedCountry.name.toLowerCase();
    const cCode = resolvedCountry.code.toLowerCase();
    const specificMatches = filtered.filter(
      (j) =>
        (j.location && (j.location.toLowerCase().includes(cName) || j.location.toLowerCase().includes(cCode))) ||
        j.remoteScope === 'worldwide'
    );
    if (specificMatches.length > 0) {
      filtered = specificMatches;
    }
  }

  // 4. Query filter (title, company, description, tags)
  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q)) ||
        j.description.toLowerCase().includes(q)
    );
  }

  // 5. Explicit location text filter (e.g. "Berlin", "Remote", "Bangalore")
  if (location && location.trim()) {
    const loc = location.toLowerCase().trim();
    filtered = filtered.filter((j) => (j.location || '').toLowerCase().includes(loc));
  }

  // 6. Remote filter
  if (remote === 'true') {
    filtered = filtered.filter((j) => j.remote === true);
  } else if (remote === 'false') {
    filtered = filtered.filter((j) => j.remote === false);
  }

  // 7. Compute match score for each job if user profile is present
  const hasCandidateData = Boolean(
    (userProfile?.skills && userProfile.skills.length > 0) ||
      userProfile?.preferredRole ||
      (resumeData?.skills && resumeData.skills.length > 0)
  );

  // Merge profile skills with resume skills if available
  const effectiveProfile = {
    ...userProfile,
    skills: Array.from(
      new Set([
        ...(userProfile?.skills || []),
        ...(Array.isArray(resumeData?.skills) ? resumeData.skills : []),
      ])
    ),
    preferredRole: userProfile?.preferredRole || resumeData?.header?.headline || '',
    workMode: userProfile?.workMode || 'any',
    experienceLevel: userProfile?.experienceLevel || 'any',
  };

  const enriched = filtered.map((job) => {
    if (hasCandidateData) {
      const matchDetails = calculateJobMatch(job, effectiveProfile, resolvedCountry.code);
      return { ...job, ...matchDetails };
    }
    return {
      ...job,
      matchScore: null,
      matchingSkills: [],
      missingSkills: [],
      matchReason: 'Add your skills or upload a resume to unlock personalized compatibility scoring.',
    };
  });

  // 8. Sort results
  if (sortBy === 'match' && hasCandidateData) {
    enriched.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  } else {
    enriched.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  }

  // Paginate jobs slice
  const paginatedSlice = enriched.slice(0, limit);

  // 9. Batch translate non-English listings in the slice before returning
  // Fast, cached, and handles quotas without crashing
  const translatedSlice = await batchTranslateJobs(paginatedSlice, 10);

  return {
    jobs: translatedSlice,
    totalCount: enriched.length,
    page: Number(page),
    hasMore: arbeitnowData.hasMore || enriched.length > limit,
    provider: 'Live Verified Providers (Arbeitnow & Remotive)',
    resolvedCountry,
  };
}
