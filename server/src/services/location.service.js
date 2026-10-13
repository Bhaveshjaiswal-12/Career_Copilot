/**
 * Location Resolution Service
 * Resolves search country with priority:
 * Priority 1: Explicit user preference (query country > profile targetLocations / preferred country / location)
 * Priority 2: Explicit resume location (city, state, or country from latest resume)
 * Priority 3: Education institution location (if confidently identified, fallback)
 * Priority 4: India default ('India' / 'IN')
 */

// Common country mappings and aliases
export const COUNTRY_MAP = {
  in: { code: 'IN', name: 'India' },
  india: { code: 'IN', name: 'India' },
  de: { code: 'DE', name: 'Germany' },
  germany: { code: 'DE', name: 'Germany' },
  deutschland: { code: 'DE', name: 'Germany' },
  us: { code: 'US', name: 'United States' },
  usa: { code: 'US', name: 'United States' },
  'united states': { code: 'US', name: 'United States' },
  uk: { code: 'GB', name: 'United Kingdom' },
  gb: { code: 'GB', name: 'United Kingdom' },
  'united kingdom': { code: 'GB', name: 'United Kingdom' },
  ca: { code: 'CA', name: 'Canada' },
  canada: { code: 'CA', name: 'Canada' },
  au: { code: 'AU', name: 'Australia' },
  australia: { code: 'AU', name: 'Australia' },
  sg: { code: 'SG', name: 'Singapore' },
  singapore: { code: 'SG', name: 'Singapore' },
  nl: { code: 'NL', name: 'Netherlands' },
  netherlands: { code: 'NL', name: 'Netherlands' },
  ae: { code: 'AE', name: 'United Arab Emirates' },
  uae: { code: 'AE', name: 'United Arab Emirates' },
  remote: { code: 'REMOTE', name: 'Worldwide / Remote' },
  all: { code: 'ALL', name: 'All Locations' },
};

// Known Indian cities, states, and regions for explicit address matching
const INDIAN_CITIES_AND_STATES = new Set([
  'india', 'bharat', 'bengaluru', 'bangalore', 'mumbai', 'bombay', 'delhi', 'new delhi',
  'hyderabad', 'chennai', 'madras', 'pune', 'kolkata', 'calcutta', 'ahmedabad', 'noida',
  'gurgaon', 'gurugram', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'bhopal',
  'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'coimbatore', 'kochi', 'cochin',
  'thiruvananthapuram', 'trivandrum', 'chandigarh', 'mysore', 'mysuru', 'bhubaneswar',
  'visakhapatnam', 'vizag', 'surat', 'karnataka', 'maharashtra', 'tamil nadu', 'telangana',
  'uttar pradesh', 'delhi ncr', 'haryana', 'punjab', 'kerala', 'gujarat', 'rajasthan',
  'west bengal', 'madhya pradesh', 'andhra pradesh', 'odisha', 'bihar', 'assam'
]);

// Other foreign cities mapped to countries
const KNOWN_FOREIGN_LOCATIONS = [
  { keywords: ['berlin', 'munich', 'münchen', 'frankfurt', 'hamburg', 'cologne', 'köln', 'stuttgart', 'düsseldorf', 'germany', 'deutschland'], country: { code: 'DE', name: 'Germany' } },
  { keywords: ['london', 'manchester', 'birmingham', 'edinburgh', 'glasgow', 'leeds', 'bristol', 'united kingdom', 'uk', 'england', 'scotland'], country: { code: 'GB', name: 'United Kingdom' } },
  { keywords: ['new york', 'san francisco', 'seattle', 'austin', 'los angeles', 'chicago', 'boston', 'united states', 'usa', 'california', 'texas', 'washington'], country: { code: 'US', name: 'United States' } },
  { keywords: ['toronto', 'vancouver', 'montreal', 'ottawa', 'calgary', 'canada', 'ontario', 'quebec', 'british columbia'], country: { code: 'CA', name: 'Canada' } },
  { keywords: ['sydney', 'melbourne', 'brisbane', 'perth', 'australia', 'nsw', 'victoria'], country: { code: 'AU', name: 'Australia' } },
  { keywords: ['singapore'], country: { code: 'SG', name: 'Singapore' } },
  { keywords: ['amsterdam', 'rotterdam', 'utrecht', 'netherlands'], country: { code: 'NL', name: 'Netherlands' } },
  { keywords: ['dubai', 'abu dhabi', 'uae', 'united arab emirates'], country: { code: 'AE', name: 'United Arab Emirates' } },
];

// Confidently identifiable Indian educational institutions
// Only confident institutions - ambiguous names (like "Trinity College", "St. Xavier's", "City College") are NOT included
const INDIAN_COLLEGE_PATTERNS = [
  /\b(iit|indian institute of technology)\b/i,
  /\b(nit|national institute of technology)\b/i,
  /\b(iiit|indian institute of information technology)\b/i,
  /\b(bits|birla institute of technology)\b/i,
  /\b(iisc|indian institute of science)\b/i,
  /\b(iim|indian institute of management)\b/i,
  /\bdelhi university\b|\buniversity of delhi\b/i,
  /\bmumbai university\b|\buniversity of mumbai\b/i,
  /\banna university\b/i,
  /\bvisvesvaraya\b|\bvtu\b/i,
  /\bjadavpur university\b/i,
  /\bvellore institute of technology\b|\bvit university\b|\bvit vellore\b/i,
  /\bmanipal (academy|institute|university)\b/i,
  /\bsrm (institute|university)\b/i,
  /\bamity university\b/i,
  /\bthapar (institute|university)\b/i,
  /\bjawaharlal nehru (technological )?university\b|\bjntu\b/i,
  /\bosmania university\b/i,
  /\bpune university\b|\bsavitribai phule pune university\b/i,
  /\bcalcutta university\b|\buniversity of calcutta\b/i,
];

// Foreign colleges with clear country identification
const FOREIGN_COLLEGE_PATTERNS = [
  { pattern: /\b(tum|technical university of munich|technische universität münchen|lmu münchen|rwth aachen|heidelberg university)\b/i, country: { code: 'DE', name: 'Germany' } },
  { pattern: /\b(oxford|cambridge|imperial college|ucl|university college london|lse|king's college london|university of edinburgh)\b/i, country: { code: 'GB', name: 'United Kingdom' } },
  { pattern: /\b(mit|massachusetts institute of technology|stanford|harvard|berkeley|carnegie mellon|caltech|columbia university|cornell|yale|princeton)\b/i, country: { code: 'US', name: 'United States' } },
  { pattern: /\b(university of toronto|ubc|university of british columbia|mcgill university|university of waterloo)\b/i, country: { code: 'CA', name: 'Canada' } },
  { pattern: /\b(university of melbourne|university of sydney|unsw|australian national university)\b/i, country: { code: 'AU', name: 'Australia' } },
  { pattern: /\b(nus|national university of singapore|ntu|nanyang technological university)\b/i, country: { code: 'SG', name: 'Singapore' } },
  { pattern: /\b(tu delft|university of amsterdam)\b/i, country: { code: 'NL', name: 'Netherlands' } },
];

/**
 * Standardize country string to canonical { code, name }
 */
export function normalizeCountry(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const clean = raw.trim().toLowerCase();
  if (COUNTRY_MAP[clean]) {
    return COUNTRY_MAP[clean];
  }

  // Check known locations
  for (const loc of KNOWN_FOREIGN_LOCATIONS) {
    if (loc.keywords.some((kw) => clean.includes(kw))) {
      return loc.country;
    }
  }

  // Check Indian cities/states
  const tokens = clean.split(/[\s,.-]+/);
  if (tokens.some((t) => INDIAN_CITIES_AND_STATES.has(t))) {
    return { code: 'IN', name: 'India' };
  }

  return null;
}

/**
 * Identify country from location text string (e.g., "Bangalore, India" or "Berlin, Germany")
 */
export function detectCountryFromLocationText(text) {
  if (!text || typeof text !== 'string') return null;
  const lower = text.toLowerCase();

  // 1. Direct match check
  const directMatch = normalizeCountry(lower);
  if (directMatch) return directMatch;

  // 2. Check for explicit India signals
  const words = lower.split(/[\s,.-]+/);
  for (const word of words) {
    if (INDIAN_CITIES_AND_STATES.has(word)) {
      return { code: 'IN', name: 'India' };
    }
  }

  // 3. Check foreign patterns
  for (const item of KNOWN_FOREIGN_LOCATIONS) {
    if (item.keywords.some((k) => lower.includes(k))) {
      return item.country;
    }
  }

  return null;
}

/**
 * Identify country from education institution string
 */
export function detectCountryFromEducation(institutionName) {
  if (!institutionName || typeof institutionName !== 'string') return null;
  const name = institutionName.trim();

  // Check Indian college regex patterns
  for (const pattern of INDIAN_COLLEGE_PATTERNS) {
    if (pattern.test(name)) {
      return { code: 'IN', name: 'India' };
    }
  }

  // Check foreign college regex patterns
  for (const item of FOREIGN_COLLEGE_PATTERNS) {
    if (item.pattern.test(name)) {
      return item.country;
    }
  }

  // Explicit country in institution text (e.g. "Delhi Technological University, India")
  return detectCountryFromLocationText(name);
}

/**
 * Resolve target search country with priority:
 * 1. Explicit user preference
 * 2. Explicit resume location
 * 3. Education institution location
 * 4. India default
 *
 * @param {Object} options
 * @param {string} [options.queryCountry] - Explicit country from request query parameter (e.g., 'IN', 'Germany', 'remote')
 * @param {Object} [options.userProfile] - User profile data (location, targetLocations, preferredCountry)
 * @param {Object} [options.resumeData] - Parsed resume data with header and education
 * @returns {{ code: string, name: string, source: string, isDefault: boolean }}
 */
export function resolveTargetCountry({ queryCountry, userProfile = {}, resumeData = null } = {}) {
  // Priority 1: Explicit user request / preference
  if (queryCountry && queryCountry.trim()) {
    const fromQuery = normalizeCountry(queryCountry);
    if (fromQuery) {
      return {
        ...fromQuery,
        source: 'user_selection',
        isDefault: false,
      };
    }
    // If user typed a custom country not in map, format cleanly
    const custom = queryCountry.trim();
    return {
      code: custom.toUpperCase().slice(0, 2),
      name: custom.charAt(0).toUpperCase() + custom.slice(1),
      source: 'user_selection',
      isDefault: false,
    };
  }

  // Profile preferences (preferredCountry, targetLocations[0], or profile.location)
  if (userProfile) {
    if (userProfile.preferredCountry) {
      const parsed = normalizeCountry(userProfile.preferredCountry);
      if (parsed) {
        return { ...parsed, source: 'user_profile_preference', isDefault: false };
      }
    }

    if (Array.isArray(userProfile.targetLocations) && userProfile.targetLocations.length > 0) {
      for (const loc of userProfile.targetLocations) {
        const parsed = detectCountryFromLocationText(loc);
        if (parsed) {
          return { ...parsed, source: 'user_profile_target_location', isDefault: false };
        }
      }
    }

    if (userProfile.location) {
      const parsed = detectCountryFromLocationText(userProfile.location);
      if (parsed) {
        return { ...parsed, source: 'user_profile_location', isDefault: false };
      }
    }
  }

  // Priority 2: Explicit resume location
  if (resumeData) {
    const resumeLocation = resumeData.header?.location;
    if (resumeLocation) {
      const parsed = detectCountryFromLocationText(resumeLocation);
      if (parsed) {
        return { ...parsed, source: 'resume_location', isDefault: false };
      }
    }

    // Also check experience locations if present
    if (Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
      const latestExp = resumeData.experience[0];
      if (latestExp?.location) {
        const parsed = detectCountryFromLocationText(latestExp.location);
        if (parsed) {
          return { ...parsed, source: 'resume_experience_location', isDefault: false };
        }
      }
    }
  }

  // Priority 3: Education institution location (confident identification only)
  if (resumeData && Array.isArray(resumeData.education) && resumeData.education.length > 0) {
    for (const edu of resumeData.education) {
      const inst = edu?.institution;
      if (inst) {
        const parsed = detectCountryFromEducation(inst);
        if (parsed) {
          return { ...parsed, source: 'resume_education_institution', isDefault: false };
        }
      }
    }
  }

  // Profile education fallback if resume education not present
  if (userProfile && Array.isArray(userProfile.education) && userProfile.education.length > 0) {
    for (const edu of userProfile.education) {
      const inst = edu?.institution;
      if (inst) {
        const parsed = detectCountryFromEducation(inst);
        if (parsed) {
          return { ...parsed, source: 'profile_education_institution', isDefault: false };
        }
      }
    }
  }

  // Priority 4: India default
  return {
    code: 'IN',
    name: 'India',
    source: 'india_default',
    isDefault: true,
  };
}
