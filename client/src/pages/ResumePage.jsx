import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft, Loader2, FileText, Sparkles, Download,
  BarChart3, Mail, Phone, MapPin, Globe, Link2,
  Edit3, Check, Printer,
} from 'lucide-react';
import api from '../services/api.js';
import { Button } from '../components/Button.jsx';

export function hasResumeData(data) {
  if (!data) return false;
  return Boolean(
    data.summary ||
    (Array.isArray(data.skills) && data.skills.length > 0) ||
    (Array.isArray(data.experience) && data.experience.length > 0) ||
    (Array.isArray(data.projects) && data.projects.length > 0) ||
    (data.header && (data.header.name || data.header.email || data.header.phone))
  );
}

function AtsScorePanel({ atsScore }) {
  if (!atsScore) return null;
  const hasScore = (atsScore.overall > 0 || atsScore.keywordMatch > 0 || atsScore.skillsMatch > 0 || atsScore.formatting > 0);
  if (!hasScore) return null;

  const metrics = [
    { label: 'Overall', value: atsScore.overall || 0 },
    { label: 'Keywords', value: atsScore.keywordMatch || 0 },
    { label: 'Skills', value: atsScore.skillsMatch || 0 },
    { label: 'Experience', value: atsScore.experienceRelevance || 0 },
    { label: 'Formatting', value: atsScore.formatting || 0 },
  ];

  const recs = atsScore.recommendations || atsScore.suggestions || [];

  return (
    <div className="bg-[#FFFFFF] border border-[#E7E1F1] rounded-2xl p-6 space-y-4 no-print shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-[#26213A] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#6845C5]" /> ATS Compatibility Assessment
        </h3>
        <span className="text-xs font-semibold text-[#6845C5] bg-[#F2EDFC] border border-[#DDD0FF] px-2.5 py-0.5 rounded-full">
          AI Scorecard
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="text-center bg-[#F8F7FC] p-3.5 rounded-xl border border-[#DDD0FF] shadow-2xs">
            <div className="text-2xl font-extrabold text-[#6845C5]">{m.value}%</div>
            <div className="text-xs text-[#716B85] mt-1 font-semibold">{m.label}</div>
          </div>
        ))}
      </div>
      {recs.length > 0 && (
        <div className="text-xs text-[#49316F] pt-3 border-t border-[#E7E1F1] leading-relaxed">
          <span className="font-bold text-[#26213A]">ATS Optimization Recommendations: </span>
          {recs.join(' • ')}
        </div>
      )}
    </div>
  );
}

function ResumePreview({ data }) {
  if (!data) return null;
  const h = data.header || {};

  return (
    <div className="bg-white text-gray-900 rounded-2xl p-8 md:p-12 shadow-sm max-w-[850px] mx-auto border border-[#E7E1F1]" id="resume-preview">
      {/* Header */}
      <div className="text-center mb-6 border-b border-gray-300 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{h.name || 'Your Name'}</h1>
        {h.headline && <p className="text-sm font-semibold text-gray-700 mt-1">{h.headline}</p>}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2.5 text-xs text-gray-600">
          {h.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-gray-400" />{h.email}</span>}
          {h.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gray-400" />{h.phone}</span>}
          {h.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" />{h.location}</span>}
          {h.linkedin && <span className="flex items-center gap-1"><Link2 className="w-3.5 h-3.5 text-gray-400" />{h.linkedin}</span>}
          {h.github && <span className="flex items-center gap-1"><Link2 className="w-3.5 h-3.5 text-gray-400" />{h.github}</span>}
          {h.portfolio && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-gray-400" />{h.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5 border-b border-gray-300 pb-1">Professional Summary</h2>
          <p className="text-xs md:text-sm text-gray-700 leading-relaxed text-justify">{data.summary}</p>
        </div>
      )}

      {/* Skills */}
      {data.skills?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5 border-b border-gray-300 pb-1">Key Competencies & Technical Skills</h2>
          <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{Array.isArray(data.skills) ? data.skills.join(' • ') : data.skills}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2 border-b border-gray-300 pb-1">Work Experience</h2>
          <div className="space-y-3.5">
            {data.experience.map((exp, i) => (
              <div key={i} className="last:mb-0">
                <div className="flex justify-between items-baseline flex-wrap gap-1">
                  <div className="font-bold text-sm text-gray-900">{exp.position}</div>
                  <div className="text-xs font-medium text-gray-600">{exp.startDate} – {exp.endDate || 'Present'}</div>
                </div>
                <div className="text-xs text-gray-700 font-semibold mb-1">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                {exp.highlights?.length > 0 && (
                  <ul className="space-y-1 mt-1">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="text-xs text-gray-700 flex items-start gap-2 leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2 border-b border-gray-300 pb-1">Key Projects</h2>
          <div className="space-y-3">
            {data.projects.map((proj, i) => (
              <div key={i}>
                <div className="font-bold text-sm text-gray-900">{proj.name}</div>
                {proj.description && <div className="text-xs text-gray-700 mt-0.5">{proj.description}</div>}
                {proj.technologies?.length > 0 && (
                  <div className="text-xs text-gray-600 mt-0.5 font-medium">
                    <span className="font-semibold text-gray-700">Technologies: </span>
                    {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                  </div>
                )}
                {proj.highlights?.length > 0 && (
                  <ul className="space-y-0.5 mt-1">
                    {proj.highlights.map((h, j) => (
                      <li key={j} className="text-xs text-gray-700 flex items-start gap-2 leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2 border-b border-gray-300 pb-1">Education</h2>
          <div className="space-y-2">
            {data.education.map((edu, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline flex-wrap gap-1">
                  <div className="font-bold text-sm text-gray-900">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                  <div className="text-xs font-medium text-gray-600">{edu.startDate} – {edu.endDate}</div>
                </div>
                <div className="text-xs text-gray-700">{edu.institution}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5 border-b border-gray-300 pb-1">Certifications & Honors</h2>
          <div className="space-y-1">
            {data.certifications.map((cert, i) => (
              <div key={i} className="text-xs text-gray-800">
                <span className="font-semibold">{cert.name}</span> — {cert.issuer} {cert.date ? `(${cert.date})` : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumePage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scoringAts, setScoringAts] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        setReport(res.data.data);
        if (res.data.data.resumeData) {
          setEditData(JSON.parse(JSON.stringify(res.data.data.resumeData)));
        }
      } catch {
        toast.error('Failed to load report.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post(`/interview/${id}/resume/generate`, {}, { timeout: 120000 });
      const newResume = res.data?.data || res.data;
      setReport((prev) => ({ ...prev, resumeData: newResume }));
      setEditData(JSON.parse(JSON.stringify(newResume)));
      toast.success('Resume generated successfully!');

      try {
        const atsRes = await api.post(`/interview/${id}/resume/ats-score`, {}, { timeout: 60000 });
        const newAts = atsRes.data?.data || atsRes.data;
        setReport((prev) => ({ ...prev, atsScore: newAts }));
      } catch (atsErr) {
        console.warn('Auto ATS evaluation skipped:', atsErr);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate resume.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAtsScore = async () => {
    if (!hasResumeData(report?.resumeData)) {
      toast.error('Please generate a resume first.');
      return;
    }
    setScoringAts(true);
    try {
      const res = await api.post(`/interview/${id}/resume/ats-score`, {}, { timeout: 60000 });
      const newAts = res.data?.data || res.data;
      setReport((prev) => ({ ...prev, atsScore: newAts }));
      toast.success('ATS analysis completed!');
    } catch (err) {
      toast.error(err.message || 'Failed to analyze ATS score.');
    } finally {
      setScoringAts(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/interview/${id}/resume`, { resumeData: editData });
      setReport((prev) => ({ ...prev, resumeData: res.data.data }));
      setIsEditing(false);
      toast.success('Resume saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save resume.');
    } finally {
      setSaving(false);
    }
  };

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!hasResumeData(report?.resumeData)) {
      toast.error('Please generate a resume first before downloading.');
      return;
    }
    setDownloadingPdf(true);
    try {
      const res = await api.post(`/interview/${id}/resume/pdf`, {}, { responseType: 'blob', timeout: 30000 });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${(report.jobTitle || 'career_copilot').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF resume downloaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Could not download PDF. You can also use the Print A4 option.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const el = document.getElementById('resume-preview');
    if (!el) return;
    const text = el.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${report.jobTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'download'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded as text file.');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#6845C5] animate-spin" />
      </div>
    );
  }

  if (!report) {
    return <p className="text-center text-[#716B85] py-16">Report not found.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="no-print">
        <Link
          to={`/reports/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#716B85] hover:text-[#6845C5] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to report
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#F2EDFC] border border-[#DDD0FF] rounded-xl flex items-center justify-center text-[#6845C5] shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#26213A]">Targeted ATS Resume</h1>
              <p className="text-[#716B85] text-sm font-medium">Optimized for {report.jobTitle} {report.company ? `at ${report.company}` : ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!hasResumeData(report.resumeData) ? (
              <Button
                variant="primary"
                onClick={handleGenerate}
                loading={generating}
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Generate Resume
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditData(JSON.parse(JSON.stringify(report.resumeData)));
                    setIsEditing(!isEditing);
                  }}
                >
                  <Edit3 className="w-4 h-4 mr-1.5 text-[#6845C5]" />
                  {isEditing ? 'Cancel Edit' : 'Edit Resume'}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerate}
                  loading={generating}
                >
                  <Sparkles className="w-4 h-4 mr-1.5 text-[#6845C5]" />
                  Regenerate
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAtsScore}
                  loading={scoringAts}
                >
                  <BarChart3 className="w-4 h-4 mr-1.5 text-[#6845C5]" />
                  Check ATS
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadPdf}
                  loading={downloadingPdf}
                  title="Direct PDF Download"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Download PDF
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrint}
                  title="Export to vector PDF using Print dialog"
                >
                  <Printer className="w-4 h-4 mr-1.5" /> Print A4
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadTxt}
                  title="Download raw text"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ATS Score Panel */}
      {report.atsScore && <AtsScorePanel atsScore={report.atsScore} />}

      {/* Edit Form Modal/Drawer */}
      {isEditing && editData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 space-y-6 border border-[#E7E1F1] no-print shadow-md"
        >
          <div className="flex items-center justify-between border-b border-[#E7E1F1] pb-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[#26213A]">
              <Edit3 className="w-5 h-5 text-[#6845C5]" /> Edit Resume Content
            </h2>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                loading={saving}
              >
                <Check className="w-4 h-4 mr-1" />
                Save Changes
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Close
              </Button>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold text-[#49316F] mb-3">Contact & Headline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={editData.header?.name || ''}
                onChange={(e) => setEditData({ ...editData, header: { ...editData.header, name: e.target.value } })}
                placeholder="Full Name"
                className="bg-white border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 shadow-xs"
              />
              <input
                type="text"
                value={editData.header?.headline || ''}
                onChange={(e) => setEditData({ ...editData, header: { ...editData.header, headline: e.target.value } })}
                placeholder="Target Headline (e.g. Senior Full-Stack Engineer)"
                className="bg-white border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 shadow-xs"
              />
              <input
                type="text"
                value={editData.header?.email || ''}
                onChange={(e) => setEditData({ ...editData, header: { ...editData.header, email: e.target.value } })}
                placeholder="Email Address"
                className="bg-white border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 shadow-xs"
              />
              <input
                type="text"
                value={editData.header?.phone || ''}
                onChange={(e) => setEditData({ ...editData, header: { ...editData.header, phone: e.target.value } })}
                placeholder="Phone Number"
                className="bg-white border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 shadow-xs"
              />
              <input
                type="text"
                value={editData.header?.location || ''}
                onChange={(e) => setEditData({ ...editData, header: { ...editData.header, location: e.target.value } })}
                placeholder="Location (e.g. San Francisco, CA)"
                className="bg-white border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 shadow-xs"
              />
              <input
                type="text"
                value={editData.header?.linkedin || ''}
                onChange={(e) => setEditData({ ...editData, header: { ...editData.header, linkedin: e.target.value } })}
                placeholder="LinkedIn URL"
                className="bg-white border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 shadow-xs"
              />
            </div>
          </div>

          {/* Professional Summary */}
          <div>
            <h3 className="text-sm font-bold text-[#49316F] mb-2">Professional Summary</h3>
            <textarea
              rows={3}
              value={editData.summary || ''}
              onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
              className="bg-white border border-[#E7E1F1] rounded-xl p-3.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 w-full leading-relaxed shadow-xs"
              placeholder="Summary highlighting experience, qualifications, and target role impact..."
            />
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-sm font-bold text-[#49316F] mb-2">Skills (comma-separated)</h3>
            <input
              type="text"
              value={Array.isArray(editData.skills) ? editData.skills.join(', ') : editData.skills || ''}
              onChange={(e) => setEditData({
                ...editData,
                skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })}
              className="bg-white border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 w-full shadow-xs"
              placeholder="e.g. React, Node.js, TypeScript, AWS, Docker, GraphQL"
            />
          </div>
        </motion.div>
      )}

      {/* Main Resume View */}
      {hasResumeData(report.resumeData) ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ResumePreview data={report.resumeData} />
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-[#DDD0FF] shadow-xs">
          <FileText className="w-14 h-14 text-[#B69AF5] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#26213A] mb-1">No Resume Generated Yet</h3>
          <p className="text-[#716B85] text-sm max-w-md mx-auto mb-6">
            Click &ldquo;Generate Resume&rdquo; above to synthesize your resume and tailored job requirements into an ATS-optimized document.
          </p>
          <Button
            variant="primary"
            onClick={handleGenerate}
            loading={generating}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Generate Now
          </Button>
        </div>
      )}
    </div>
  );
}
