import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  FileText,
  Search,
  Trash2,
  Eye,
  PlusCircle,
  Calendar,
  Target,
  FolderOpen,
} from 'lucide-react';
import api from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Badge } from '../components/Badge.jsx';
import { Modal } from '../components/Modal.jsx';
import { SkeletonCard } from '../components/Skeleton.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/interview', {
        params: { page, search, limit: 10 },
      });
      setReports(res.data.data || []);
      setPagination(res.data.pagination || { pages: 1, total: 0 });
    } catch (err) {
      toast.error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, search]);

  const confirmDelete = (report) => {
    setReportToDelete(report);
    setDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/interview/${reportToDelete._id}`);
      toast.success('Report deleted successfully.');
      setDeleteModalOpen(false);
      setReportToDelete(null);
      fetchReports();
    } catch (err) {
      toast.error('Failed to delete report.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Analysis Reports"
        description="Review previous resume analyses, interview questions, and tailored ATS resumes."
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Reports' },
        ]}
        action={
          <Button
            variant="primary"
            onClick={() => (window.location.href = '/analyze')}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        }
      />

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#918BA2] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by job title, company name, or keywords..."
          className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
        />
      </div>

      {/* Reports List / Loading / Empty */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={search ? 'No matching reports found' : 'No analysis reports yet'}
          description={
            search
              ? 'Try modifying your search term or clearing the filter.'
              : 'Analyze a job description against your resume to generate your first comprehensive report.'
          }
          actionLabel={search ? 'Clear Search' : 'Create First Analysis'}
          onAction={() => {
            if (search) setSearch('');
            else window.location.href = '/analyze';
          }}
        />
      ) : (
        <div className="space-y-3">
          {reports.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card hover className="p-5 border-[#E7E1F1]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#F2EDFC] border border-[#DDD0FF] flex items-center justify-center shrink-0 text-[#6845C5] shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-[#26213A] truncate">
                          {r.jobTitle}
                        </span>
                        {r.hasResume && (
                          <Badge variant="neutral" size="sm">
                            Tailored Resume
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-[#49316F] mt-0.5 font-semibold">
                        {r.companyName || 'Target Organization'}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-[#716B85]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#918BA2]" />
                          {new Date(r.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1.5 font-bold text-[#6845C5]">
                          <Target className="w-3.5 h-3.5 text-[#6845C5]" />
                          {r.matchScore}% Match
                        </span>
                        <span>{r.technicalCount} Technical Qs</span>
                        <span>{r.behavioralCount} Behavioral Qs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7E1F1]">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => (window.location.href = `/reports/${r._id}`)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5 text-[#6845C5]" />
                      View Report
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => confirmDelete(r)}
                      aria-label="Delete report"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#918BA2] hover:text-[#B83A52]" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all border ${
                p === page
                  ? 'bg-[#6845C5] text-white border-[#6845C5] shadow-xs'
                  : 'bg-white text-[#716B85] hover:text-[#26213A] border-[#E7E1F1]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Analysis Report"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#716B85]">
            Are you sure you want to permanently delete the report for{' '}
            <strong className="text-[#26213A]">
              &quot;{reportToDelete?.jobTitle}&quot;
            </strong>
            ? This action cannot be undone and will remove the preparation roadmap, generated questions, and tailored resume.
          </p>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExecuteDelete}
              loading={isDeleting}
            >
              Delete Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
