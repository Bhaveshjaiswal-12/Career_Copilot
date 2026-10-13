/**
 * Translation Service for Job Discovery
 * Detects non-English job postings (particularly German),
 * translates title and description into English via Gemini with caching,
 * while preserving proper nouns, company names, URLs, salaries, and technical terms.
 * Handles quota exhaustion and timeouts gracefully without crashing or faking translations.
 */

import { GoogleGenAI } from '@google/genai';

// In-memory cache for translated jobs with 24-hour TTL to prevent redundant AI calls
const translationCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// High-confidence German vocabulary and patterns
const GERMAN_INDICATOR_REGEX = /\b(und|der|die|das|für|mit|von|wir suchen|vollzeit|teilzeit|ab sofort|oder|ihre aufgaben|ihr profil|unser angebot|erfahrung|kenntnisse|standort|vergütung|leistungen|weiterbildung|bewerben|bereich|m\/w\/d|gn|d\/m\/w)\b/i;
const GERMAN_UMLAUTS_REGEX = /[äöüßÄÖÜ]/;

/**
 * Fast detection of German language in text
 */
export function isGermanOrNonEnglish(text) {
  if (!text || typeof text !== 'string') return false;
  const sample = text.slice(0, 1000);

  // Check umlauts
  const hasUmlauts = GERMAN_UMLAUTS_REGEX.test(sample);

  // Count common German words
  const matches = sample.match(new RegExp(GERMAN_INDICATOR_REGEX.source, 'gi'));
  const matchCount = matches ? matches.length : 0;

  // If text contains umlauts and at least 1 German indicator, or 3+ German indicators
  if ((hasUmlauts && matchCount >= 1) || matchCount >= 3) {
    return true;
  }

  // Check for common German job patterns like "(m/w/d)"
  if (/\((?:m\/w\/d|d\/m\/w|gn)\)/i.test(sample)) {
    return true;
  }

  return false;
}

/**
 * Get cached translation if available and fresh
 */
export function getCachedTranslation(jobId) {
  if (!jobId) return null;
  const cached = translationCache.get(jobId);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    translationCache.delete(jobId);
    return null;
  }
  return cached.data;
}

/**
 * Store translation in cache
 */
export function setCachedTranslation(jobId, data) {
  if (!jobId) return;
  // Limit cache size to 500 items
  if (translationCache.size > 500) {
    const oldestKey = translationCache.keys().next().value;
    translationCache.delete(oldestKey);
  }
  translationCache.set(jobId, { data, timestamp: Date.now() });
}

/**
 * Translate a single job title & description using Gemini API
 * Returns { title, description, isTranslated: true, sourceLanguage: 'German' }
 * On quota exhaustion or error, returns original with clear error flag without inventing text.
 */
export async function translateJobWithGemini({ id, title, description, company, url, salary }) {
  // Check cache first
  const cached = getCachedTranslation(id);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  const isTitleNonEnglish = isGermanOrNonEnglish(title);
  const isDescNonEnglish = isGermanOrNonEnglish(description);

  // If both are already English, return as-is
  if (!isTitleNonEnglish && !isDescNonEnglish) {
    const res = {
      translatedTitle: title,
      translatedDescription: description,
      isTranslated: false,
      sourceLanguage: 'English',
      originalTitle: title,
      originalDescription: description,
    };
    setCachedTranslation(id, res);
    return res;
  }

  // If no Gemini API key configured, fail gracefully without inventing
  if (!process.env.GEMINI_API_KEY) {
    return {
      translatedTitle: title,
      translatedDescription: description,
      isTranslated: false,
      sourceLanguage: 'German',
      originalTitle: title,
      originalDescription: description,
      translationUnavailable: true,
      translationNotice: 'Translation unavailable: Gemini API key not configured on server.',
    };
  }

  const CANDIDATE_TRANSLATION_MODELS = [
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash-lite',
  ].filter(Boolean);

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are a professional technical translator for employment listings.
Translate the following job listing from German into natural, professional English.

RULES:
1. Translate the job title and job description into clear, modern English.
2. PRESERVE proper nouns, company names ("${company || ''}"), URLs, emails, locations, salary amounts, certifications, and technical terms (e.g., Python, Kubernetes, AWS) exactly as they are.
3. Remove German gender markers like "(m/w/d)" from the English title naturally.
4. Do NOT hallucinate or add qualifications not in the original text.
5. Return ONLY a valid JSON object matching this schema:
{
  "translatedTitle": "English title here",
  "translatedDescription": "English description summary here",
  "detectedSourceLanguage": "German"
}

ORIGINAL TITLE:
${title}

ORIGINAL DESCRIPTION (Excerpt):
${(description || '').slice(0, 3000)}`;

    let response = null;
    let lastError = null;

    for (const model of CANDIDATE_TRANSLATION_MODELS) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        });
        if (response && response.text) break;
      } catch (err) {
        lastError = err;
        console.warn(`[Translation Service] Model ${model} failed: ${err.message}. Trying next candidate...`);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('Empty translation response from AI model.');
    }

    let parsed;
    try {
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
      }
      parsed = JSON.parse(cleanText);
    } catch {
      throw new Error('Malformed JSON received from translation service.');
    }

    const result = {
      translatedTitle: parsed.translatedTitle || title,
      translatedDescription: parsed.translatedDescription || description,
      isTranslated: true,
      sourceLanguage: parsed.detectedSourceLanguage || 'German',
      originalTitle: title,
      originalDescription: description,
      translationUnavailable: false,
    };

    setCachedTranslation(id, result);
    return result;
  } catch (err) {
    const isQuota =
      err.status === 429 ||
      err.message?.includes('429') ||
      err.message?.includes('RESOURCE_EXHAUSTED') ||
      err.message?.includes('Quota');

    const notice = isQuota
      ? 'Translation service quota reached. Showing original German listing.'
      : `Translation error (${err.message || 'service timeout'}). Showing original listing.`;

    const fallback = {
      translatedTitle: title,
      translatedDescription: description,
      isTranslated: false,
      sourceLanguage: 'German',
      originalTitle: title,
      originalDescription: description,
      translationUnavailable: true,
      translationNotice: notice,
      quotaExhausted: isQuota,
    };

    // Cache fallback temporarily (5 min) to avoid slamming the failed API
    setCachedTranslation(id, fallback);
    return fallback;
  }
}

/**
 * Batch translate non-English jobs in parallel with concurrency limit
 * Limits concurrency to 4 simultaneous translations to avoid rate limits
 */
export async function batchTranslateJobs(jobs, maxToTranslate = 10) {
  if (!Array.isArray(jobs) || jobs.length === 0) return jobs;

  // Identify which jobs need translation
  const enrichedJobs = [...jobs];
  const translationTasks = [];

  for (let i = 0; i < enrichedJobs.length; i++) {
    const job = enrichedJobs[i];
    const needsTranslation = isGermanOrNonEnglish(job.title) || isGermanOrNonEnglish(job.description);

    if (needsTranslation && translationTasks.length < maxToTranslate) {
      translationTasks.push({
        index: i,
        job,
      });
    }
  }

  // If no jobs need translation, return immediately
  if (translationTasks.length === 0) {
    return enrichedJobs.map((j) => ({
      ...j,
      isTranslated: false,
      sourceLanguage: 'English',
      originalTitle: j.title,
      originalDescription: j.description,
    }));
  }

  // Run translations with max concurrency of 3
  const CONCURRENCY = 3;
  for (let i = 0; i < translationTasks.length; i += CONCURRENCY) {
    const batch = translationTasks.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async ({ index, job }) => {
        try {
          const trans = await translateJobWithGemini(job);
          enrichedJobs[index] = {
            ...job,
            title: trans.translatedTitle,
            description: trans.translatedDescription,
            isTranslated: trans.isTranslated,
            sourceLanguage: trans.sourceLanguage,
            originalTitle: trans.originalTitle,
            originalDescription: trans.originalDescription,
            translationUnavailable: Boolean(trans.translationUnavailable),
            translationNotice: trans.translationNotice || null,
          };
        } catch {
          // Keep original on unexpected failure
          enrichedJobs[index] = {
            ...job,
            isTranslated: false,
            sourceLanguage: 'German',
            originalTitle: job.title,
            originalDescription: job.description,
            translationUnavailable: true,
            translationNotice: 'Unable to translate listing at this time.',
          };
        }
      })
    );
  }

  // For remaining jobs not in the translation batch, flag whether they are non-English
  for (let i = 0; i < enrichedJobs.length; i++) {
    if (!enrichedJobs[i].originalTitle) {
      const isGerman = isGermanOrNonEnglish(enrichedJobs[i].title) || isGermanOrNonEnglish(enrichedJobs[i].description);
      enrichedJobs[i] = {
        ...enrichedJobs[i],
        isTranslated: false,
        sourceLanguage: isGerman ? 'German' : 'English',
        originalTitle: enrichedJobs[i].title,
        originalDescription: enrichedJobs[i].description,
      };
    }
  }

  return enrichedJobs;
}
