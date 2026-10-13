/**
 * Prompt for full interview analysis.
 * Produces: candidateSummary, jobSummary, matchScore, strengths, weaknesses,
 *           skillGaps, technicalQuestions, behavioralQuestions, preparationRoadmap
 */
export function buildInterviewAnalysisPrompt(resumeText, jobDescription, selfDescription) {
  return `You are an expert career coach, technical interviewer, and ATS resume specialist.

Analyze the following candidate data against the target job and produce a comprehensive JSON report.

=== CANDIDATE RESUME ===
${resumeText || 'No resume provided.'}

=== JOB DESCRIPTION ===
${jobDescription}

=== CANDIDATE SELF-DESCRIPTION ===
${selfDescription || 'No self-description provided.'}

Produce a JSON object with EXACTLY these keys (no markdown, no explanation, just valid JSON):

{
  "jobTitle": "extracted or inferred job title",
  "companyName": "extracted company name or 'Unknown'",
  "candidateSummary": "2-3 sentence summary of the candidate's profile",
  "jobSummary": "2-3 sentence summary of what this role requires",
  "matchScore": <number 0-100>,
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "skillGaps": [
    {
      "skill": "skill name",
      "category": "strong" | "partial" | "missing",
      "importance": "high" | "medium" | "low",
      "reason": "why this matters for the role",
      "currentLevel": <number 1-5>,
      "targetLevel": <number 1-5>,
      "learningPriority": "immediate" | "short-term" | "long-term"
    }
  ],
  "technicalQuestions": [
    {
      "question": "the interview question",
      "difficulty": "easy" | "medium" | "hard",
      "topic": "topic area",
      "whyAsked": "why an interviewer would ask this",
      "expectedAnswerPoints": ["point1", "point2", ...]
    }
  ],
  "behavioralQuestions": [
    {
      "question": "the behavioral question",
      "intent": "what the interviewer is looking for",
      "category": "teamwork" | "conflict" | "leadership" | "failure" | "ownership" | "deadlines" | "communication" | "problem-solving",
      "suggestedApproach": "how to structure the answer"
    }
  ],
  "preparationRoadmap": [
    {
      "day": 1,
      "title": "Day 1 focus title",
      "tasks": [
        {
          "topic": "what to study/do",
          "priority": "high" | "medium" | "low",
          "estimatedTime": "e.g. 2 hours",
          "reason": "why this task matters",
          "resources": ["resource link or name"]
        }
      ]
    }
  ]
}

REQUIREMENTS:
- Generate 8-12 skill gaps covering strong, partial, and missing categories
- Generate 10-15 technical questions mixing easy/medium/hard difficulties
- Generate 6-8 behavioral questions across different categories
- Generate a 7-day preparation roadmap with 2-4 tasks per day
- matchScore should honestly reflect how well the candidate fits
- All analysis must be grounded in the provided data
- Do NOT invent skills, experience, or qualifications the candidate doesn't have
- Clearly distinguish between detected facts and recommendations

Return ONLY the JSON object, no markdown fences, no explanations.`;
}
