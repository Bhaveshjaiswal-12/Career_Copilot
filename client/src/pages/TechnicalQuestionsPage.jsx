import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import api from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { Card } from '../components/Card.jsx';
import { Badge } from '../components/Badge.jsx';

export default function TechnicalQuestionsPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        setReport(res.data.data);
      } catch {
        toast.error('Failed to load questions.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleToggleComplete = async (idx) => {
    if (!report) return;
    const updated = [...report.technicalQuestions];
    updated[idx] = { ...updated[idx], completed: !updated[idx].completed };
    try {
      await api.put(`/interview/${id}/progress`, { technicalQuestions: updated });
      setReport({ ...report, technicalQuestions: updated });
    } catch {
      toast.error('Failed to update progress.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#6845C5] animate-spin" />
      </div>
    );
  }

  if (!report) return <p className="text-center text-[#716B85] py-16">Report not found.</p>;

  const questions = report.technicalQuestions || [];
  const filtered = filter === 'all' ? questions : questions.filter((q) => q.difficulty === filter);
  const completedCount = questions.filter((q) => q.completed).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Technical Interview Questions"
        description={`${completedCount} of ${questions.length} questions practiced for ${report.jobTitle}`}
        breadcrumbs={[
          { label: 'Reports', to: '/reports' },
          { label: report.jobTitle, to: `/reports/${id}` },
          { label: 'Technical' },
        ]}
      />

      {/* Progress Bar */}
      <div className="w-full bg-[#F1EDF9] rounded-full h-2.5 overflow-hidden border border-[#E7E1F1]">
        <div
          className="h-full bg-[#6845C5] transition-all duration-300"
          style={{ width: `${questions.length > 0 ? (completedCount / questions.length) * 100 : 0}%` }}
        />
      </div>

      {/* Difficulty Filters */}
      <div className="flex gap-2">
        {['all', 'easy', 'medium', 'hard'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              filter === f
                ? 'bg-[#6845C5] text-white border-[#6845C5] shadow-xs'
                : 'bg-white text-[#716B85] border-[#E7E1F1] hover:text-[#26213A] hover:bg-[#F2EDFC]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        {filtered.map((q) => {
          const origIdx = questions.indexOf(q);
          const isExpanded = expandedQ === origIdx;
          return (
            <Card
              key={origIdx}
              className={`overflow-hidden transition-all border-[#E7E1F1] bg-[#FFFFFF] ${q.completed ? 'opacity-70 bg-[#F8F7FC]' : ''}`}
            >
              <div
                className="p-5 cursor-pointer flex items-start gap-3.5 select-none"
                onClick={() => setExpandedQ(isExpanded ? null : origIdx)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleComplete(origIdx);
                  }}
                  className={`mt-0.5 w-5 h-5 rounded-lg border transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
                    q.completed
                      ? 'bg-[#6845C5] border-[#6845C5] text-white shadow-xs'
                      : 'border-[#DDD0FF] hover:border-[#6845C5] bg-white'
                  }`}
                  aria-label={q.completed ? 'Mark incomplete' : 'Mark completed'}
                >
                  {q.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div
                    className={`font-bold text-sm leading-relaxed ${
                      q.completed ? 'line-through text-[#918BA2]' : 'text-[#26213A]'
                    }`}
                  >
                    {q.question}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="neutral" size="sm">
                      {q.difficulty}
                    </Badge>
                    <span className="text-xs font-medium text-[#716B85]">{q.topic}</span>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#918BA2] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#918BA2] shrink-0" />
                )}
              </div>

              {isExpanded && (
                <div className="border-t border-[#E7E1F1] p-5 bg-[#F8F7FC] space-y-3 text-xs leading-relaxed">
                  {q.whyAsked && (
                    <div>
                      <div className="font-bold text-[#49316F] uppercase tracking-wider text-[11px] mb-1">
                        Interviewer Intent
                      </div>
                      <p className="text-[#716B85]">{q.whyAsked}</p>
                    </div>
                  )}

                  {q.expectedAnswerPoints && q.expectedAnswerPoints.length > 0 && (
                    <div>
                      <div className="font-bold text-[#49316F] uppercase tracking-wider text-[11px] mb-1">
                        Key Points to Cover
                      </div>
                      <ul className="space-y-1">
                        {q.expectedAnswerPoints.map((pt, j) => (
                          <li key={j} className="text-[#26213A] flex items-start gap-2">
                            <span className="text-[#6845C5] font-bold mt-0.5">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
