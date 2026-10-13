import { asyncHandler } from '../utils/errors.js';
import InterviewReport from '../models/InterviewReport.js';
import SavedJob from '../models/SavedJob.js';
import User from '../models/User.js';

/**
 * GET /api/dashboard/stats
 * Returns dashboard statistics for the authenticated user.
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [reports, savedJobsCount, user] = await Promise.all([
    InterviewReport.find({ userId }).sort({ createdAt: -1 }).lean(),
    SavedJob.countDocuments({ userId }),
    User.findById(userId).select('name profile').lean(),
  ]);

  const totalAnalyses = reports.length;
  const resumesGenerated = reports.filter((r) => r.resumeData).length;

  const matchScores = reports
    .map((r) => r.matchScore)
    .filter((s) => typeof s === 'number');
  const averageAtsScore =
    matchScores.length > 0
      ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)
      : 0;

  const allSkills = new Set();
  reports.forEach((r) => {
    (r.skillGaps || []).forEach((sg) => {
      if (sg.skill) allSkills.add(sg.skill);
    });
  });

  const recentReports = reports.slice(0, 5).map((r) => ({
    _id: r._id,
    jobTitle: r.jobTitle || 'Untitled',
    companyName: r.companyName || 'Unknown',
    matchScore: r.matchScore || 0,
    createdAt: r.createdAt,
    technicalCount: (r.technicalQuestions || []).length,
    behavioralCount: (r.behavioralQuestions || []).length,
    hasResume: !!r.resumeData,
  }));

  // Score history for charts (last 10)
  const scoreHistory = reports
    .slice(0, 10)
    .reverse()
    .map((r) => ({
      date: r.createdAt,
      score: r.matchScore || 0,
      jobTitle: r.jobTitle || 'Untitled',
    }));

  // Calculate real profile completeness from user's persisted fields
  const p = user?.profile || {};
  const criteria = [
    { label: 'Full Name', filled: Boolean(user?.name) },
    { label: 'Target Role', filled: Boolean(p.preferredRole) },
    { label: 'Professional Headline', filled: Boolean(p.headline) },
    { label: 'Summary', filled: Boolean(p.summary) },
    { label: 'Skills', filled: Array.isArray(p.skills) && p.skills.length > 0 },
    { label: 'Work Experience', filled: Array.isArray(p.experience) && p.experience.length > 0 },
    { label: 'Education', filled: Array.isArray(p.education) && p.education.length > 0 },
    { label: 'Location or Phone', filled: Boolean(p.location || p.phone) },
  ];
  const filledCount = criteria.filter((c) => c.filled).length;
  const completenessPercentage = Math.round((filledCount / criteria.length) * 100);
  const missingFields = criteria.filter((c) => !c.filled).map((c) => c.label);

  res.json({
    success: true,
    data: {
      totalAnalyses,
      resumesGenerated,
      averageAtsScore,
      skillsIdentified: allSkills.size,
      interviewReports: totalAnalyses,
      savedJobsCount,
      profileCompleteness: {
        percentage: completenessPercentage,
        missingFields,
      },
      recentReports,
      scoreHistory,
    },
  });
});
