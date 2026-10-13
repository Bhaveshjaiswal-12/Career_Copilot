import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

export default function JobDiscoveryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'saved'
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState('all'); // 'all' | 'true' | 'false'
  const [sortBy, setSortBy] = useState('match'); // 'match' | 'recent'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [providerInfo, setProviderInfo] = useState('');

  // Save/unsave loading state per job
  const [savingId, setSavingId] = useState(null);

  // Fetch jobs
  const fetchJobs = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      setError(null);

      const targetPage = isLoadMore ? page + 1 : 1;
      const res = await jobService.getJobs({
        query,
        location,
        remote,
        sortBy,
        page: targetPage,
        limit: 15,
      });

      if (res.success) {
        if (isLoadMore) {
          setJobs((prev) => [...prev, ...res.data.jobs]);
          setPage(targetPage);
        } else {
          setJobs(res.data.jobs || []);
          setPage(1);
        }
        setHasMore(res.data.hasMore);
        setProviderInfo(res.data.provider || 'Arbeitnow');
      }
    } catch (err) {
      console.error('Job fetch error:', err);
      setError(err.message || 'Unable to load job listings at this time.');
    } finally {
      setLoading(false);
    }
  }, [query, location, remote, sortBy, page]);

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

  // Initial load
  useEffect(() => {
    fetchJobs(false);
    fetchSaved();
  }, [query, location, remote, sortBy]);

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

  const hasProfileSkills = Boolean(user?.profile?.skills?.length || user?.profile?.preferredRole);

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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-[#918BA2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                />
              </div>

              {/* Location input */}
              <div className="md:col-span-3 relative">
                <MapPin className="w-4 h-4 text-[#918BA2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Location or City..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                />
              </div>

              {/* Work mode filter */}
              <div className="md:col-span-2">
                <select
                  value={remote}
                  onChange={(e) => setRemote(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3 py-2.5 text-sm text-[#26213A] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all cursor-pointer shadow-xs"
                  aria-label="Work mode"
                >
                  <option value="all">All Locations</option>
                  <option value="true">Remote Only</option>
                  <option value="false">On-site / Office</option>
                </select>
              </div>

              {/* Sort filter */}
              <div className="md:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3 py-2.5 text-sm text-[#26213A] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all cursor-pointer shadow-xs"
                  aria-label="Sort by"
                >
                  <option value="match">Sort: Match Score</option>
                  <option value="recent">Sort: Most Recent</option>
                </select>
              </div>
            </div>

            {/* Provider Attribution */}
            <div className="mt-3 pt-3 border-t border-[#E7E1F1] flex items-center justify-between text-xs text-[#716B85]">
              <span>
                Verified live source:{' '}
                <strong className="text-[#26213A] font-semibold">{providerInfo}</strong>
              </span>
              <button
                onClick={() => fetchJobs(false)}
                className="flex items-center gap-1.5 text-[#6845C5] hover:text-[#5736AE] font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
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
              description="Try adjusting your keyword search, clearing location filters, or resetting work mode options."
              actionLabel="Clear Filters"
              onAction={() => {
                setQuery('');
                setLocation('');
                setRemote('all');
                setSortBy('match');
              }}
            />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const isSaved = job.isSaved || savedJobs.some((s) => s.jobId === job.id);
                return (
                  <Card key={job.id} hover className="p-6 transition-all border-[#E7E1F1]">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Job Info */}
                      <div className="space-y-2.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-[#26213A] hover:text-[#6845C5] transition-colors">
                            {job.title}
                          </h3>
                          {job.remote && (
                            <Badge variant="neutral" size="sm">
                              Remote
                            </Badge>
                          )}
                          {job.source && (
                            <span className="text-[11px] text-[#918BA2] font-medium">
                              via {job.source}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#716B85]">
                          <span className="font-bold text-[#49316F]">{job.company}</span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#918BA2]" />
                            {job.location || 'Remote'}
                          </span>
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

                        {/* Description Preview */}
                        {job.description && (
                          <p className="text-xs text-[#716B85] line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>
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

                            {/* Matching vs Missing skills breakdown */}
                            {job.matchingSkills && job.matchingSkills.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] text-[#716B85] font-medium">Aligned skills:</span>
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
