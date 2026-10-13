import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import jobService from '../services/jobService.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { Card } from '../components/Card.jsx';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { SkeletonCard } from '../components/Skeleton.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { toast } from 'sonner';
import {
  Search,
  MapPin,
  Briefcase,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Clock,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Globe,
  Languages,
  DollarSign,
  ChevronDown,
  Info,
} from 'lucide-react';

const COUNTRY_OPTIONS = [
  { value: 'IN', label: 'India (Default Market)' },
  { value: 'REMOTE', label: 'Worldwide / Remote' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'ALL', label: 'All Global Openings' },
];

export default function JobDiscoveryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'saved'
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [resolvedCountryInfo, setResolvedCountryInfo] = useState({ code: 'IN', name: 'India', source: 'india_default' });
  const [locationText, setLocationText] = useState('');
  const [workMode, setWorkMode] = useState('all'); // 'all' | 'true' | 'false'
  const [sortBy, setSortBy] = useState('match'); // 'match' | 'recent'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [providerInfo, setProviderInfo] = useState('Live Verified Providers (Arbeitnow & Remotive)');

  // Track expanded original text toggles by job ID
  const [expandedOriginals, setExpandedOriginals] = useState(new Set());

  // Save/unsave loading state per job
  const [savingId, setSavingId] = useState(null);

  // Abort controller ref to cancel obsolete requests
  const abortControllerRef = useRef(null);

  // Debounce search query input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch jobs
  const fetchJobs = useCallback(
    async (isLoadMore = false) => {
      // Abort previous in-flight request if loading anew
      if (!isLoadMore && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        if (!isLoadMore) setLoading(true);
        setError(null);

        const targetPage = isLoadMore ? page + 1 : 1;
        const res = await jobService.getJobs({
          query: debouncedQuery,
          country: selectedCountry,
          location: locationText,
          remote: workMode,
          sortBy: hasProfileSkills ? sortBy : 'recent',
          page: targetPage,
          limit: 15,
        });

        if (res.success) {
          if (isLoadMore) {
            setJobs((prev) => [...prev, ...(res.data.jobs || [])]);
            setPage(targetPage);
          } else {
            setJobs(res.data.jobs || []);
            setPage(1);
          }
          setHasMore(Boolean(res.data.hasMore));
          if (res.data.provider) setProviderInfo(res.data.provider);
          if (res.data.resolvedCountry) {
            setResolvedCountryInfo(res.data.resolvedCountry);
          }
        }
      } catch (err) {
        if (err.name === 'AbortError' || err.message?.includes('canceled')) {
          return; // Ignore aborted requests
        }
        console.error('Job fetch error:', err);
        setError(err.message || 'Unable to load verified job listings. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [debouncedQuery, selectedCountry, locationText, workMode, sortBy, page]
  );

  // Fetch saved jobs
  const fetchSaved = useCallback(async () => {
    try {
      const res = await jobService.getSavedJobs();
      if (res.success) {
        setSavedJobs(res.data.savedJobs || []);
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    }
  }, []);

  // Initial load and filter change trigger
  useEffect(() => {
    if (activeTab === 'explore') {
      fetchJobs(false);
    }
  }, [debouncedQuery, selectedCountry, locationText, workMode, sortBy]);

  useEffect(() => {
    fetchSaved();
  }, []);

  // Toggle original language vs English translation view
  const toggleOriginalText = (jobId) => {
    setExpandedOriginals((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  // Toggle save
  const handleToggleSave = async (job) => {
    const isCurrentlySaved = job.isSaved || savedJobs.some((s) => s.jobId === job.id || s.jobId === job.jobId);
    setSavingId(job.id || job.jobId);

    try {
      if (isCurrentlySaved) {
        await jobService.removeSavedJob(job.id || job.jobId);
        toast.success(`Removed "${job.title}" from saved jobs.`);
        setSavedJobs((prev) => prev.filter((s) => s.jobId !== (job.id || job.jobId)));
        setJobs((prev) =>
          prev.map((j) => (j.id === (job.id || job.jobId) ? { ...j, isSaved: false } : j))
        );
      } else {
        await jobService.saveJob({
          jobId: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          remote: job.remote,
          url: job.url,
          description: job.description,
          tags: job.tags,
          source: job.source,
          salary: job.salary,
        });
        toast.success(`Saved "${job.title}" to your shortlist.`);
        fetchSaved();
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, isSaved: true } : j))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update saved job status.');
    } finally {
      setSavingId(null);
    }
  };

  const hasProfileSkills = Boolean(
    (user?.profile?.skills && user.profile.skills.length > 0) || user?.profile?.preferredRole
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Job Discovery"
        description="Search real verified job openings and see transparent compatibility scores matched against your profile and resume."
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Job Discovery' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'explore' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('explore')}
            >
              <Briefcase className="w-3.5 h-3.5 mr-1.5" />
              Explore Openings
            </Button>
            <Button
              variant={activeTab === 'saved' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setActiveTab('saved');
                fetchSaved();
              }}
            >
              <Bookmark className="w-3.5 h-3.5 mr-1.5" />
              Saved Jobs ({savedJobs.length})
            </Button>
          </div>
        }
      />

      {/* Profile Notice if skills not configured */}
      {!hasProfileSkills && activeTab === 'explore' && (
        <div className="p-4 rounded-2xl border border-[#DDD0FF] bg-[#F2EDFC]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3 text-[#49316F]">
            <div className="p-2 rounded-xl bg-white text-[#6845C5] shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>
              Tip: Add your skills and target role in your{' '}
              <a href="/profile" className="font-bold underline text-[#6845C5] hover:text-[#5736AE]">
                Profile
              </a>{' '}
              to unlock personalized compatibility scores and skill gap breakdowns.
            </span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => (window.location.href = '/profile')}>
            Set Up Profile
          </Button>
        </div>
      )}

      {/* Explore Tab View */}
      {activeTab === 'explore' && (
        <>
          {/* Search & Filter Toolbar */}
          <Card className="p-4 border-[#E7E1F1]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              {/* Search input with debounce */}
              <div className="lg:col-span-4 relative">
                <Search className="w-4 h-4 text-[#918BA2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                />
              </div>

              {/* Country & Target Market Selector */}
              <div className="lg:col-span-3 relative">
                <Globe className="w-4 h-4 text-[#6845C5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl pl-10 pr-8 py-2.5 text-sm text-[#26213A] font-medium focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all cursor-pointer shadow-xs appearance-none"
                  aria-label="Target search country"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#918BA2] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Location or City Text Input */}
              <div className="lg:col-span-2 relative">
                <MapPin className="w-4 h-4 text-[#918BA2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="City / Region..."
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                />
              </div>

              {/* Work mode filter */}
              <div className="lg:col-span-1.5">
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3 py-2.5 text-sm text-[#26213A] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all cursor-pointer shadow-xs"
                  aria-label="Work mode"
                >
                  <option value="all">All Modes</option>
                  <option value="true">Remote</option>
                  <option value="false">On-site</option>
                </select>
              </div>

              {/* Sort filter */}
              <div className="lg:col-span-1.5">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3 py-2.5 text-sm text-[#26213A] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all cursor-pointer shadow-xs"
                  aria-label="Sort by"
                >
                  {hasProfileSkills ? (
                    <>
                      <option value="match">Match Score</option>
                      <option value="recent">Most Recent</option>
                    </>
                  ) : (
                    <option value="recent">Most Recent</option>
                  )}
                </select>
              </div>
            </div>

            {/* Resolved Location Badge & Attribution Row */}
            <div className="mt-3 pt-3 border-t border-[#E7E1F1] flex flex-wrap items-center justify-between gap-2 text-xs text-[#716B85]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5">
                  Search Market:
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F2EDFC] text-[#6845C5] font-bold border border-[#DDD0FF]">
                    <Globe className="w-3 h-3" />
                    {resolvedCountryInfo?.name || 'India'}
                    {resolvedCountryInfo?.source === 'india_default' && ' (Default)'}
                  </span>
                </span>
                <span className="text-[#918BA2]">•</span>
                <span>
                  Source: <strong className="text-[#26213A] font-semibold">{providerInfo}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                {(searchQuery || locationText || workMode !== 'all' || selectedCountry !== 'IN') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setLocationText('');
                      setWorkMode('all');
                      setSelectedCountry('IN');
                      setSortBy('match');
                    }}
                    className="text-[#716B85] hover:text-[#26213A] underline cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => fetchJobs(false)}
                  className="flex items-center gap-1.5 text-[#6845C5] hover:text-[#5736AE] font-semibold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>
            </div>
          </Card>

          {/* Job List State Handling */}
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : error ? (
            <Card className="p-8 text-center border-[#E7E1F1]">
              <AlertCircle className="w-10 h-10 text-[#B83A52] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#26213A] mb-1">
                Unable to load job listings
              </h3>
              <p className="text-sm text-[#716B85] max-w-md mx-auto mb-4">{error}</p>
              <Button variant="secondary" onClick={() => fetchJobs(false)}>
                Try Again
              </Button>
            </Card>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs found matching your criteria"
              description="Try adjusting your keyword search, choosing a different search market, or clearing location filters."
              actionLabel="Reset to India Default"
              onAction={() => {
                setSearchQuery('');
                setLocationText('');
                setSelectedCountry('IN');
                setWorkMode('all');
                setSortBy('match');
              }}
            />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const isSaved = job.isSaved || savedJobs.some((s) => s.jobId === job.id);
                const isOriginalExpanded = expandedOriginals.has(job.id);

                return (
                  <Card key={job.id} hover className="p-6 transition-all border-[#E7E1F1]">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Job Info */}
                      <div className="space-y-2.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-[#26213A] hover:text-[#6845C5] transition-colors">
                            {job.title}
                          </h3>

                          {/* Translation Badge */}
                          {job.isTranslated && (
                            <Badge variant="purple" size="sm" className="gap-1">
                              <Languages className="w-3 h-3" />
                              Translated from {job.sourceLanguage || 'German'}
                            </Badge>
                          )}

                          {/* Translation Quota / Error Notice */}
                          {job.translationUnavailable && job.translationNotice && (
                            <span className="text-[11px] text-[#B83A52] bg-[#FDF2F4] px-2 py-0.5 rounded-md font-medium border border-[#F5C2CB]">
                              Original listing: {job.sourceLanguage || 'German'}
                            </span>
                          )}

                          {/* Remote Scope Badge */}
                          {job.remote && (
                            <Badge variant="neutral" size="sm">
                              {job.remoteScope === 'worldwide'
                                ? 'Worldwide Remote'
                                : job.remoteScope === 'india'
                                ? 'Remote in India'
                                : 'Remote'}
                            </Badge>
                          )}

                          {job.source && (
                            <span className="text-[11px] text-[#918BA2] font-medium">
                              via {job.source}
                            </span>
                          )}
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#716B85]">
                          <span className="font-bold text-[#49316F]">{job.company}</span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#918BA2]" />
                            {job.location || 'Remote'}
                          </span>
                          {job.salary && (
                            <span className="flex items-center gap-1 text-[#227248] font-semibold bg-[#EBF7F0] px-2 py-0.5 rounded-md">
                              <DollarSign className="w-3 h-3" />
                              {job.salary}
                            </span>
                          )}
                          {job.employmentType && (
                            <span className="capitalize">{job.employmentType}</span>
                          )}
                          {job.postedAt && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#918BA2]" />
                              {new Date(job.postedAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>

                        {/* Description Preview (English) */}
                        {job.description && (
                          <p className="text-xs text-[#716B85] line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>
                        )}

                        {/* Original German Listing Drawer if translated */}
                        {job.isTranslated && job.originalTitle && (
                          <div className="pt-1">
                            <button
                              onClick={() => toggleOriginalText(job.id)}
                              className="text-[11px] font-semibold text-[#6845C5] hover:text-[#5736AE] underline cursor-pointer flex items-center gap-1"
                            >
                              <Languages className="w-3 h-3" />
                              {isOriginalExpanded ? 'Hide original German text' : 'View original German listing'}
                            </button>

                            {isOriginalExpanded && (
                              <div className="mt-2 p-3 rounded-xl bg-[#F8F7FC] border border-[#E7E1F1] text-xs text-[#49316F] space-y-1">
                                <div className="font-bold text-[#26213A]">{job.originalTitle}</div>
                                <div className="text-[11px] text-[#716B85] leading-relaxed line-clamp-3">
                                  {job.originalDescription}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tags */}
                        {job.tags && job.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {job.tags.slice(0, 6).map((tag, idx) => (
                              <Badge key={idx} variant="neutral" size="sm">
                                {tag}
                              </Badge>
                            ))}
                            {job.tags.length > 6 && (
                              <span className="text-[11px] text-[#918BA2] self-center font-medium">
                                +{job.tags.length - 6} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Match Analysis Explanation */}
                        {job.matchScore !== null && job.matchScore !== undefined && (
                          <div className="pt-2.5 mt-2.5 border-t border-[#E7E1F1] flex flex-col gap-1.5 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#26213A]">
                                Match Analysis:
                              </span>
                              <span className="text-[#716B85]">{job.matchReason}</span>
                            </div>

                            {/* Matching skills breakdown */}
                            {job.matchingSkills && job.matchingSkills.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] text-[#716B85] font-medium">Matching skills:</span>
                                {job.matchingSkills.map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-lg bg-[#F2EDFC] border border-[#DDD0FF] text-[11px] text-[#6845C5] font-semibold"
                                  >
                                    ✓ {s}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Missing requirements */}
                            {job.missingSkills && job.missingSkills.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] text-[#918BA2] font-medium">Missing requirements:</span>
                                {job.missingSkills.slice(0, 4).map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-lg bg-[#F8F7FC] border border-[#E7E1F1] text-[11px] text-[#716B85]"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Score & Actions */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#E7E1F1]">
                        {/* Match Score Display */}
                        {job.matchScore !== null && job.matchScore !== undefined ? (
                          <div className="flex flex-col items-end">
                            <div className="text-2xl font-extrabold text-[#6845C5] tracking-tight">
                              {job.matchScore}%
                            </div>
                            <span className="text-[10px] tracking-wider uppercase text-[#918BA2] font-bold">
                              Compatibility
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-[#918BA2] font-medium">General Listing</div>
                        )}

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            aria-label={isSaved ? 'Remove from saved' : 'Save job'}
                            onClick={() => handleToggleSave(job)}
                            loading={savingId === (job.id || job.jobId)}
                          >
                            {isSaved ? (
                              <BookmarkCheck className="w-3.5 h-3.5 text-[#6845C5]" />
                            ) : (
                              <Bookmark className="w-3.5 h-3.5 text-[#918BA2]" />
                            )}
                          </Button>

                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#6845C5] text-white hover:bg-[#5736AE] shadow-xs hover:shadow transition-all"
                          >
                            <span>Apply on Site</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => fetchJobs(true)}
                    loading={loading}
                  >
                    Load More Jobs
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Saved Jobs Tab View */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedJobs.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No saved jobs yet"
              description="Browse open roles in the Explore tab and bookmark positions you'd like to apply to or track."
              actionLabel="Explore Jobs"
              onAction={() => setActiveTab('explore')}
            />
          ) : (
            savedJobs.map((job) => (
              <Card key={job._id || job.jobId} hover className="p-6 border-[#E7E1F1]">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#26213A]">
                        {job.title}
                      </h3>
                      {job.remote && (
                        <Badge variant="neutral" size="sm">
                          Remote
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#716B85]">
                      <span className="font-bold text-[#49316F]">{job.company}</span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#918BA2]" />
                        {job.location || 'Remote'}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1 text-[#227248] font-semibold bg-[#EBF7F0] px-2 py-0.5 rounded-md">
                          <DollarSign className="w-3 h-3" />
                          {job.salary}
                        </span>
                      )}
                      {job.createdAt && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#918BA2]" />
                          Saved on{' '}
                          {new Date(job.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-xs text-[#716B85] line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                    )}

                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.tags.map((tag, idx) => (
                          <Badge key={idx} variant="neutral" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggleSave(job)}
                      loading={savingId === (job.id || job.jobId)}
                    >
                      <BookmarkCheck className="w-3.5 h-3.5 mr-1 text-[#6845C5]" />
                      Remove
                    </Button>

                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#6845C5] text-white hover:bg-[#5736AE] shadow-xs hover:shadow transition-all"
                    >
                      <span>Apply on Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
