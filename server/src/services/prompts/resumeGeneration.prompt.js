/**
 * Prompt for ATS-optimized resume generation.
 * CRITICAL: Anti-hallucination instructions are mandatory.
 */
export function buildResumeGenerationPrompt(resumeText, jobDescription, candidateInfo, skillGaps) {
  return `You are an expert ATS resume writer and career consultant.

Generate an ATS-optimized resume for the candidate targeting the specified job.

=== CANDIDATE RESUME DATA ===
${resumeText || 'No resume provided.'}

=== TARGET JOB DESCRIPTION ===
${jobDescription}

=== CANDIDATE INFORMATION ===
${candidateInfo || 'No additional info.'}

=== IDENTIFIED SKILL GAPS ===
${JSON.stringify(skillGaps || [], null, 2)}

CRITICAL INSTRUCTIONS:
- You MUST ONLY use factual information contained in the supplied candidate data.
- Do NOT invent employment, education, projects, certifications, metrics, companies, responsibilities, technologies, or achievements.
- You MAY rephrase, restructure, and optimize existing information.
- Prioritize job-relevant skills and keywords naturally.
- Optimize bullet points for ATS parsing.
- Use strong action verbs.
- Maintain truthful content at all times.

Return a JSON object with EXACTLY this structure:

{
  "header": {
    "name": "candidate name",
    "headline": "professional headline targeting the role",
    "email": "email",
    "phone": "phone",
    "location": "location",
    "linkedin": "linkedin url",
    "github": "github url",
    "portfolio": "portfolio url"
  },
  "summary": "2-3 sentence ATS-optimized professional summary",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "company": "company name",
      "position": "job title",
      "location": "city, state",
      "startDate": "Mon YYYY",
      "endDate": "Mon YYYY or Present",
      "current": false,
      "highlights": ["achievement bullet 1", "achievement bullet 2"]
    }
  ],
  "projects": [
    {
      "name": "project name",
      "description": "brief description",
      "technologies": ["tech1", "tech2"],
      "highlights": ["what you built/achieved"],
      "url": "project url if available"
    }
  ],
  "education": [
    {
      "institution": "school name",
      "degree": "degree type",
      "field": "field of study",
      "startDate": "YYYY",
      "endDate": "YYYY",
      "gpa": "GPA if notable"
    }
  ],
  "certifications": [
    {
      "name": "cert name",
      "issuer": "issuing org",
      "date": "date",
      "url": "verification url"
    }
  ],
  "achievements": ["achievement 1", "achievement 2"]
}

Return ONLY valid JSON, no markdown, no explanation.`;
}

/**
 * Prompt for ATS score analysis.
 */
export function buildAtsScorePrompt(resumeData, jobDescription) {
  return `You are an ATS (Applicant Tracking System) analysis expert.

Analyze this resume against the job description and provide an ATS compatibility score.

=== RESUME DATA ===
${JSON.stringify(resumeData, null, 2)}

=== JOB DESCRIPTION ===
${jobDescription}

Return a JSON object:

{
  "overall": <number 0-100>,
  "keywordMatch": <number 0-100>,
  "skillsMatch": <number 0-100>,
  "experienceRelevance": <number 0-100>,
  "formatting": <number 0-100>,
  "recommendations": [
    "actionable recommendation 1",
    "actionable recommendation 2",
    ...
  ]
}

NOTE: This is an AI-estimated score, not from an actual ATS vendor.

Return ONLY valid JSON.`;
}
