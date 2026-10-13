import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import api from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { Card } from '../components/Card.jsx';

export default function RoadmapPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        setReport(res.data.data);
        if (res.data.data.preparationRoadmap?.length) setActiveDay(0);
      } catch {
        toast.error('Failed to load roadmap.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleToggleTask = async (dayIdx, taskIdx) => {
    if (!report) return;
    const updated = report.preparationRoadmap.map((d, di) => ({
      ...d,
      tasks: d.tasks.map((t, ti) =>
        di === dayIdx && ti === taskIdx ? { ...t, completed: !t.completed } : t
      ),
    }));
    try {
      await api.put(`/interview/${id}/progress`, { preparationRoadmap: updated });
      setReport({ ...report, preparationRoadmap: updated });
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

  const roadmap = report.preparationRoadmap || [];
  const totalTasks = roadmap.reduce((acc, d) => acc + (d.tasks?.length || 0), 0);
  const completedTasks = roadmap.reduce(
    (acc, d) => acc + (d.tasks || []).filter((t) => t.completed).length,
    0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Preparation Roadmap"
        description={`${completedTasks} of ${totalTasks} tasks completed across a ${roadmap.length}-day schedule`}
        breadcrumbs={[
          { label: 'Reports', to: '/reports' },
          { label: report.jobTitle, to: `/reports/${id}` },
          { label: 'Roadmap' },
        ]}
      />

      {/* Overall Progress Bar */}
      <div className="w-full bg-[#F1EDF9] rounded-full h-2.5 overflow-hidden border border-[#E7E1F1]">
        <div
          className="h-full bg-[#6845C5] transition-all duration-300"
          style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
        />
      </div>

      <div className="grid lg:grid-cols-[250px_1fr] gap-6">
        {/* Day Selector Sidebar */}
        <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {roadmap.map((day, i) => {
            const dayComplete = (day.tasks || []).length > 0 && (day.tasks || []).every((t) => t.completed);
            const dayProgress =
              day.tasks?.length > 0
                ? Math.round(
                    (day.tasks.filter((t) => t.completed).length / day.tasks.length) * 100
                  )
                : 0;

            return (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className={`flex-shrink-0 text-left px-4 py-3.5 rounded-2xl text-sm transition-all border cursor-pointer ${
                  activeDay === i
                    ? 'bg-[#F2EDFC] text-[#49316F] border-[#DDD0FF] shadow-xs ring-2 ring-[#DDD0FF]/60 font-bold'
                    : 'bg-white text-[#716B85] border-[#E7E1F1] hover:text-[#26213A] hover:bg-[#F8F7FC]'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Day {day.day}</span>
                  {dayComplete && <CheckCircle2 className="w-4 h-4 text-[#247A57]" />}
                </div>
                <div className="text-xs text-[#716B85] mt-0.5 truncate font-medium">{day.title}</div>
                <div className="w-full bg-[#E7E1F1] rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className="h-full bg-[#6845C5] transition-all duration-300 rounded-full"
                    style={{ width: `${dayProgress}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Tasks List for Selected Day */}
        <div className="space-y-3">
          {activeDay !== null &&
            roadmap[activeDay]?.tasks?.map((task, ti) => (
              <Card
                key={ti}
                className={`p-5 transition-all border-[#E7E1F1] bg-[#FFFFFF] shadow-sm ${task.completed ? 'opacity-70 bg-[#F8F7FC]' : ''}`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => handleToggleTask(activeDay, ti)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
                      task.completed
                        ? 'bg-[#6845C5] border-[#6845C5] text-white shadow-xs'
                        : 'border-[#DDD0FF] hover:border-[#6845C5] bg-white'
                    }`}
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-bold text-sm leading-relaxed ${
                        task.completed ? 'line-through text-[#918BA2]' : 'text-[#26213A]'
                      }`}
                    >
                      {task.topic}
                    </div>

                    {task.reason && (
                      <p className="text-xs text-[#716B85] mt-1 leading-relaxed">{task.reason}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2.5 text-xs text-[#716B85]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#918BA2]" />
                        {task.estimatedTime || '1h'}
                      </span>
                      <span className="capitalize">
                        Priority: <strong className="text-[#49316F] font-bold">{task.priority}</strong>
                      </span>
                    </div>

                    {task.resources?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {task.resources.map((r, ri) => (
                          <span
                            key={ri}
                            className="text-[11px] bg-[#F2EDFC] border border-[#DDD0FF] px-2.5 py-1 rounded-lg text-[#6845C5] font-semibold flex items-center gap-1.5"
                          >
                            <BookOpen className="w-3 h-3 text-[#6845C5]" />
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
