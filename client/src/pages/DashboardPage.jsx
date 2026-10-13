import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { Card } from '../components/Card.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import {
  BarChart3,
  FileText,
  Target,
  Brain,
  Bookmark,
  PlusCircle,
  Briefcase,
  User,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function CustomChartTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white border border-[#DDD0FF] rounded-xl p-3 shadow-xl text-xs">
        <p className="font-bold text-[#26213A] truncate max-w-[200px]">
          {item.jobTitle}
        </p>
        <p className="text-[#716B85] mt-1">
          Compatibility Score:{' '}
          <span className="font-bold text-[#6845C5]">{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (isMounted) {
          setStats(res.data?.data || res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 w-full bg-white border border-[#E7E1F1] rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-[#E7E1F1] rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white border border-[#E7E1F1] rounded-2xl animate-pulse" />
          <div className="h-72 bg-white border border-[#E7E1F1] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const data = stats || {
    totalAnalyses: 0,
    resumesGenerated: 0,
    averageAtsScore: 0,
    skillsIdentified: 0,
    savedJobsCount: 0,
    recentReports: [],
    scoreHistory: [],
    profileCompleteness: { percentage: 25, missingFields: [] },
  };

  const completeness = data.profileCompleteness || { percentage: 0, missingFields: [] };
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-white border border-[#E7E1F1] shadow-sm shadow-[#49316F]/4 relative overflow-hidden">
        {/* Decorative soft lavender glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F2EDFC]/60 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#26213A]">
              Welcome back, {firstName}
            </h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F2EDFC] text-[#6845C5] border border-[#DDD0FF]">
              Pro
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#716B85] mt-1 leading-relaxed">
            Track your interview analyses, discover aligned job openings, and customize resumes for target roles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <Button
            variant="primary"
            onClick={() => (window.location.href = '/analyze')}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Analysis
          </Button>

          <Button
            variant="secondary"
            onClick={() => (window.location.href = '/jobs')}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Discover Jobs
          </Button>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          icon={BarChart3}
          label="Total Analyses"
          value={data.totalAnalyses}
          subtext="Reports generated"
        />
        <StatCard
          icon={FileText}
          label="Tailored Resumes"
          value={data.resumesGenerated}
          subtext="ATS optimized"
        />
        <StatCard
          icon={Target}
          label="Average Match"
          value={`${data.averageAtsScore}%`}
          subtext="Across target roles"
        />
        <StatCard
          icon={Brain}
          label="Skills Analyzed"
          value={data.skillsIdentified}
          subtext="Tracked competencies"
        />
        <StatCard
          icon={Bookmark}
          label="Saved Jobs"
          value={data.savedJobsCount || 0}
          subtext="Shortlisted openings"
        />
      </div>

      {/* Profile Completion Indicator Card */}
      <Card className="p-4 sm:p-5 border-[#E7E1F1]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F2EDFC] border border-[#DDD0FF] flex items-center justify-center shrink-0 text-[#6845C5]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#26213A]">
                  Profile Completeness
                </span>
                <Badge variant="elevated" size="sm">
                  {completeness.percentage}%
                </Badge>
              </div>
              <p className="text-xs text-[#716B85] mt-0.5">
                {completeness.percentage === 100
                  ? 'Your profile is fully configured for optimal resume matching.'
                  : `Next step: Add ${completeness.missingFields?.slice(0, 2).join(', ') || 'skills'} to enhance job recommendations.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress bar */}
            <div className="w-32 bg-[#F1EDF9] h-2 rounded-full overflow-hidden border border-[#E7E1F1] hidden md:block">
              <div
                className="bg-[#6845C5] h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness.percentage}%` }}
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => (window.location.href = '/profile')}
            >
              Update Profile
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Grid: Match History & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Score History Chart (2 Cols) */}
        <Card className="lg:col-span-2 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#26213A]">
                  Match Score History
                </h2>
                <p className="text-xs text-[#716B85]">
                  Historical compatibility scores across your analyzed positions
                </p>
              </div>
              <Badge variant="elevated" size="sm">
                Last {data.scoreHistory.length} analyses
              </Badge>
            </div>

            {data.scoreHistory.length >= 2 ? (
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.scoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EDF9" vertical={false} />
                    <XAxis
                      dataKey="jobTitle"
                      tick={{ fill: '#716B85', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#E7E1F1' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#716B85', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#E7E1F1' }}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#6845C5"
                      strokeWidth={2.5}
                      dot={{ fill: '#FFFFFF', stroke: '#6845C5', strokeWidth: 2, r: 4 }}
                      activeDot={{ fill: '#6845C5', stroke: '#DDD0FF', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : data.scoreHistory.length === 1 ? (
              <div className="py-12 px-4 text-center rounded-2xl bg-[#F8F7FC] border border-[#E7E1F1]">
                <p className="text-sm font-bold text-[#26213A]">
                  Single Analysis Recorded: {data.scoreHistory[0].jobTitle}
                </p>
                <div className="text-3xl font-extrabold text-[#6845C5] my-2">
                  {data.scoreHistory[0].score}% Match
                </div>
                <p className="text-xs text-[#716B85] max-w-sm mx-auto">
                  Run another analysis against a different job description to start tracking historical match trends.
                </p>
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl bg-[#F8F7FC] border border-[#E7E1F1]">
                <Target className="w-8 h-8 text-[#918BA2] mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-[#26213A]">
                  No historical trend available
                </p>
                <p className="text-xs text-[#716B85] mt-1 max-w-xs mx-auto">
                  Upload your resume and analyze job descriptions to visualize match progression.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-[#E7E1F1] flex items-center justify-between text-xs text-[#716B85]">
            <span>Score combines skill coverage, seniority alignment, and role requirements.</span>
            <Link to="/reports" className="hover:text-[#6845C5] transition-colors font-medium">
              View all reports →
            </Link>
          </div>
        </Card>

        {/* Recent Reports / Activity (1 Col) */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-[#26213A]">Recent Reports</h2>
              <Link
                to="/reports"
                className="text-xs text-[#6845C5] hover:text-[#49316F] transition-colors font-semibold"
              >
                View all ({data.totalAnalyses})
              </Link>
            </div>

            {data.recentReports.length > 0 ? (
              <div className="space-y-2.5">
                {data.recentReports.map((r) => (
                  <Link
                    key={r._id}
                    to={`/reports/${r._id}`}
                    className="block p-3 rounded-xl bg-[#F8F7FC] border border-[#E7E1F1] hover:border-[#DDD0FF] hover:bg-[#F2EDFC] transition-colors group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#26213A] truncate group-hover:text-[#6845C5] transition-colors">
                          {r.jobTitle}
                        </div>
                        <div className="text-[11px] text-[#716B85] truncate mt-0.5">
                          {r.companyName}
                        </div>
                      </div>
                      <Badge variant="elevated" size="sm">
                        {r.matchScore}%
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E7E1F1] text-[11px] text-[#918BA2]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(r.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>
                        {r.technicalCount + r.behavioralCount} Qs
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center rounded-2xl bg-[#F8F7FC] border border-dashed border-[#DDD0FF]">
                <FileText className="w-7 h-7 text-[#918BA2] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-[#26213A]">
                  No reports generated yet
                </p>
                <p className="text-[11px] text-[#716B85] mt-1 px-4">
                  Run your first analysis to unlock preparation questions and roadmap.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => (window.location.href = '/analyze')}
                >
                  Start Analysis
                </Button>
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-[#E7E1F1]">
            <Link
              to="/analyze"
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-[#F2EDFC] text-xs font-semibold text-[#49316F] hover:bg-[#EAE2FA] border border-[#DDD0FF] transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Analyze Another Job
            </Link>
          </div>
        </Card>
      </div>

      {/* Onboarding Guidance (When User Has 0 Analyses) */}
      {data.totalAnalyses === 0 && (
        <Card className="p-6 border-[#E7E1F1] bg-white">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2 text-[#26213A] font-bold text-base">
              <Sparkles className="w-4 h-4 text-[#6845C5]" />
              Getting Started with Career Copilot
            </div>
            <p className="text-xs text-[#716B85] leading-relaxed mb-4">
              Career Copilot helps you prepare for technical & behavioral interviews and tailor ATS-compliant resumes for specific target roles. Here is the recommended workflow:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E1F1]">
                <div className="w-6 h-6 rounded-full bg-[#F2EDFC] border border-[#DDD0FF] flex items-center justify-center text-xs font-bold text-[#6845C5] mb-2">
                  1
                </div>
                <div className="text-xs font-semibold text-[#26213A]">Set Profile Skills</div>
                <p className="text-[11px] text-[#716B85] mt-1 leading-relaxed">
                  Add your current experience and target role preferences to personalize job matching.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E1F1]">
                <div className="w-6 h-6 rounded-full bg-[#F2EDFC] border border-[#DDD0FF] flex items-center justify-center text-xs font-bold text-[#6845C5] mb-2">
                  2
                </div>
                <div className="text-xs font-semibold text-[#26213A]">Analyze a Job</div>
                <p className="text-[11px] text-[#716B85] mt-1 leading-relaxed">
                  Upload your resume and paste a job description to extract skill gaps and interview questions.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E1F1]">
                <div className="w-6 h-6 rounded-full bg-[#F2EDFC] border border-[#DDD0FF] flex items-center justify-center text-xs font-bold text-[#6845C5] mb-2">
                  3
                </div>
                <div className="text-xs font-semibold text-[#26213A]">Discover Openings</div>
                <p className="text-[11px] text-[#716B85] mt-1 leading-relaxed">
                  Search live tech jobs and view compatibility scores against your profile.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
