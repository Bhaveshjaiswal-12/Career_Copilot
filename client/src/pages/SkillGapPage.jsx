import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { Card } from '../components/Card.jsx';
import { Badge } from '../components/Badge.jsx';

function SkillBar({ skill }) {
  const isStrong = skill.category === 'strong';
  const pct = Math.round(((skill.currentLevel || 1) / (skill.targetLevel || 5)) * 100);

  return (
    <Card className="p-5 space-y-3.5 border-[#E7E1F1] bg-[#FFFFFF] shadow-sm hover:border-[#DDD0FF] transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-bold text-[#26213A] text-sm">{skill.skill}</div>
          {skill.reason && (
            <div className="text-xs text-[#716B85] mt-0.5 leading-relaxed">{skill.reason}</div>
          )}
        </div>
        <Badge variant={isStrong ? 'outline' : 'neutral'} size="sm">
          {skill.category}
        </Badge>
      </div>

      <div className="w-full bg-[#F1EDF9] rounded-full h-2 overflow-hidden border border-[#E7E1F1]">
        <div
          className="h-full bg-[#6845C5] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-[#716B85]">
        <span>Assessed: Level {skill.currentLevel || 1}/5</span>
        <span className="font-bold text-[#49316F]">Target: Level {skill.targetLevel || 5}/5</span>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-[#E7E1F1] text-[11px] text-[#716B85]">
        <span>Priority: <span className="text-[#49316F] font-bold capitalize">{skill.learningPriority || 'Normal'}</span></span>
        <span>Importance: <span className="text-[#49316F] font-bold capitalize">{skill.importance || 'Medium'}</span></span>
      </div>
    </Card>
  );
}

export default function SkillGapPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        setReport(res.data.data);
      } catch {
        toast.error('Failed to load skill gap data.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#6845C5] animate-spin" />
      </div>
    );
  }

  if (!report) return <p className="text-center text-[#716B85] py-16">Report not found.</p>;

  const skills = report.skillGaps || [];
  const filtered = filter === 'all' ? skills : skills.filter((s) => s.category === filter);

  const counts = {
    all: skills.length,
    strong: skills.filter((s) => s.category === 'strong').length,
    partial: skills.filter((s) => s.category === 'partial').length,
    missing: skills.filter((s) => s.category === 'missing').length,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Skill Gap Analysis"
        description={`${report.jobTitle} at ${report.companyName}`}
        breadcrumbs={[
          { label: 'Reports', to: '/reports' },
          { label: report.jobTitle, to: `/reports/${id}` },
          { label: 'Skill Gaps' },
        ]}
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'strong', 'partial', 'missing'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              filter === f
                ? 'bg-[#6845C5] text-white border-[#6845C5] shadow-xs'
                : 'bg-white text-[#716B85] border-[#E7E1F1] hover:text-[#26213A] hover:bg-[#F2EDFC]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((skill, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <SkillBar skill={skill} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
