import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import api from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { Card } from '../components/Card.jsx';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';

export default function BehavioralQuestionsPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState(null);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        setReport(res.data.data);
        const n = {};
        (res.data.data.behavioralQuestions || []).forEach((q, i) => {
          n[i] = q.userNotes || '';
        });
        setNotes(n);
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
    const updated = [...report.behavioralQuestions];
    updated[idx] = { ...updated[idx], completed: !updated[idx].completed };
    try {
      await api.put(`/interview/${id}/progress`, { behavioralQuestions: updated });
      setReport({ ...report, behavioralQuestions: updated });
    } catch {
      toast.error('Failed to update progress.');
    }
  };

  const handleSaveNotes = async (idx) => {
    const updated = [...report.behavioralQuestions];
    updated[idx] = { ...updated[idx], userNotes: notes[idx] || '' };
    try {
      await api.put(`/interview/${id}/progress`, { behavioralQuestions: updated });
      setReport({ ...report, behavioralQuestions: updated });
      toast.success('Notes saved successfully.');
    } catch {
      toast.error('Failed to save notes.');
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

  const questions = report.behavioralQuestions || [];
  const completedCount = questions.filter((q) => q.completed).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Behavioral Interview Questions"
        description={`${completedCount} of ${questions.length} practiced • STAR method preparation for ${report.jobTitle}`}
        breadcrumbs={[
          { label: 'Reports', to: '/reports' },
          { label: report.jobTitle, to: `/reports/${id}` },
          { label: 'Behavioral' },
        ]}
      />

      {/* Progress Bar */}
      <div className="w-full bg-[#F1EDF9] rounded-full h-2.5 overflow-hidden border border-[#E7E1F1]">
        <div
          className="h-full bg-[#6845C5] transition-all duration-300"
          style={{ width: `${questions.length > 0 ? (completedCount / questions.length) * 100 : 0}%` }}
        />
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => {
          const isExpanded = expandedQ === i;

          return (
            <Card
              key={i}
              className={`overflow-hidden transition-all border-[#E7E1F1] bg-[#FFFFFF] ${q.completed ? 'opacity-70 bg-[#F8F7FC]' : ''}`}
            >
              <div
                className="p-5 cursor-pointer flex items-start gap-3.5 select-none"
                onClick={() => setExpandedQ(isExpanded ? null : i)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleComplete(i);
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
                      {q.category || 'Behavioral'}
                    </Badge>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#918BA2] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#918BA2] shrink-0" />
                )}
              </div>

              {isExpanded && (
                <div className="border-t border-[#E7E1F1] p-5 bg-[#F8F7FC] space-y-3.5 text-xs leading-relaxed">
                  {q.intent && (
                    <div>
                      <div className="font-bold text-[#49316F] uppercase tracking-wider text-[11px] mb-1">
                        Evaluation Intent
                      </div>
                      <p className="text-[#716B85]">{q.intent}</p>
                    </div>
                  )}

                  {q.suggestedApproach && (
                    <div>
                      <div className="font-bold text-[#49316F] uppercase tracking-wider text-[11px] mb-1">
                        Suggested STAR Approach
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-[#E7E1F1] text-[#26213A] shadow-2xs">
                        {q.suggestedApproach}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#E7E1F1]">
                    <div className="font-bold text-[#49316F] uppercase tracking-wider text-[11px] mb-1.5">
                      Your STAR Story Notes
                    </div>
                    <textarea
                      value={notes[i] || ''}
                      onChange={(e) => setNotes({ ...notes, [i]: e.target.value })}
                      placeholder="Situation, Task, Action, and Measurable Result..."
                      rows={4}
                      className="w-full bg-white border border-[#E7E1F1] rounded-xl p-3.5 text-xs text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all resize-y leading-relaxed shadow-xs"
                    />
                    <div className="mt-2.5 flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSaveNotes(i)}
                      >
                        Save Notes
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
