/**
 * Job Discovery Service
 * Integrates with permitted job data providers (default: Arbeitnow API, optional Adzuna),
 * normalizes schemas, caches results in-memory with TTL, and computes personalized
 * match scores against user profile skills and preferences.
 */

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
  // Cap cache size to avoid unbounded memory usage
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
        'Accept': 'application/json',
        'User-Agent': 'CareerCopilot/2.0 (Job Matching)',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Arbeitnow API returned HTTP ${res.status}`);
    }

    const json = await res.json();
    const rawJobs = json.data || [];

    const normalized = rawJobs.map((item) => ({
      id: item.slug || `job-${Math.random().toString(36).substring(2, 9)}`,
      title: item.title || 'Untitled Role',
      company: item.company_name || 'Hiring Company',
      location: item.location || (item.remote ? 'Remote' : 'Location Not Specified'),
      remote: Boolean(item.remote),
      url: item.url,
      description: item.description ? item.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '',
      tags: Array.isArray(item.tags) ? item.tags : [],
      postedAt: item.created_at ? new Date(item.created_at * 1000).toISOString() : new Date().toISOString(),
      source: 'Arbeitnow',
      salary: '', // Arbeitnow does not consistently supply salary
    }));

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
 * Score a job against candidate profile / resume
 */
export function calculateJobMatch(job, userProfile = {}) {
  const userSkills = (userProfile.skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  const preferredRole = (userProfile.preferredRole || '').toLowerCase().trim();
  const userWorkMode = (userProfile.workMode || 'any').toLowerCase();

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

  // Calculate score breakdown: Base (15) + Skills (up to 50) + Role (up to 20) + WorkMode (up to 15)
  let score = 20;

  if (userSkills.length > 0) {
    const totalConsideredSkills = Math.max(1, matchingSkills.length + Math.min(4, missingSkills.length));
    const skillRatio = matchingSkills.length / totalConsideredSkills;
    score += Math.round(skillRatio * 45); // up to 45 pts
  }

  // Role title alignment
  if (preferredRole && jobTitle.includes(preferredRole)) {
    score += 20;
  } else if (preferredRole && preferredRole.split(' ').some((word) => word.length > 3 && jobTitle.includes(word))) {
    score += 10;
  }

  // Work mode preference alignment
  if (userWorkMode === 'remote' && job.remote) {
    score += 15;
  } else if (userWorkMode === 'on-site' && !job.remote) {
    score += 10;
  } else if (userWorkMode === 'any') {
    score += 8;
  }

  // Clamp 10 - 98 (transparent match heuristic)
  score = Math.min(98, Math.max(15, score));

  // Human explanation
  let matchReason = '';
  if (matchingSkills.length > 0) {
    const sample = matchingSkills.slice(0, 3).join(', ');
    matchReason = `Matches skills: ${sample}.`;
    if (preferredRole && jobTitle.includes(preferredRole)) {
      matchReason += ` Closely aligns with your target role "${userProfile.preferredRole}".`;
    }
  } else if (preferredRole && jobTitle.includes(preferredRole)) {
    matchReason = `Direct title match for target role "${userProfile.preferredRole}".`;
  } else {
    matchReason = 'General alignment based on industry keywords and job classification.';
  }

  return {
    matchScore: score,
    matchingSkills,
    missingSkills: missingSkills.slice(0, 6),
    matchReason,
  };
}

/**
 * Main Job Search Function with query filtering, sorting & matching
 */
export async function searchJobs({
  query = '',
  location = '',
  remote = 'all', // 'all', 'true', 'false'
  sortBy = 'match', // 'match' or 'recent'
  page = 1,
  limit = 20,
  userProfile = null,
}) {
  const { jobs: rawJobs, hasMore } = await fetchArbeitnowJobs(page);

  let filtered = rawJobs;

  // Filter by query (title, company, description, tags)
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

  // Filter by location
  if (location && location.trim()) {
    const loc = location.toLowerCase().trim();
    filtered = filtered.filter((j) => j.location.toLowerCase().includes(loc));
  }

  // Filter by remote
  if (remote === 'true') {
    filtered = filtered.filter((j) => j.remote === true);
  } else if (remote === 'false') {
    filtered = filtered.filter((j) => j.remote === false);
  }

  // Compute match score for each job if user profile is present
  const enriched = filtered.map((job) => {
    if (userProfile && (userProfile.skills?.length || userProfile.preferredRole)) {
      const matchDetails = calculateJobMatch(job, userProfile);
      return { ...job, ...matchDetails };
    }
    return {
      ...job,
      matchScore: null,
      matchingSkills: [],
      missingSkills: [],
      matchReason: 'Complete your profile skills to enable personalized match scoring.',
    };
  });

  // Sort
  if (sortBy === 'match' && userProfile && (userProfile.skills?.length || userProfile.preferredRole)) {
    enriched.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  } else {
    // Sort by recent
    enriched.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  }

  return {
    jobs: enriched.slice(0, limit),
    totalCount: enriched.length,
    page: Number(page),
    hasMore,
    provider: 'Arbeitnow (Live Tech Board)',
  };
}
