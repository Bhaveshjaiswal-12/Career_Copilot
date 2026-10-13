import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  User,
  Phone,
  MapPin,
  Link2,
  Check,
  Award,
  Target,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Badge } from '../components/Badge.jsx';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    summary: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    skills: '',
    preferredRole: '',
    workMode: 'any',
    experienceLevel: 'any',
    employmentType: 'any',
    targetLocations: '',
  });

  useEffect(() => {
    if (user) {
      const p = user.profile || {};
      setFormData({
        name: user.name || '',
        headline: p.headline || '',
        summary: p.summary || '',
        phone: p.phone || '',
        location: p.location || '',
        linkedin: p.linkedin || '',
        github: p.github || '',
        portfolio: p.portfolio || '',
        skills: Array.isArray(p.skills) ? p.skills.join(', ') : p.skills || '',
        preferredRole: p.preferredRole || '',
        workMode: p.workMode || 'any',
        experienceLevel: p.experienceLevel || 'any',
        employmentType: p.employmentType || 'any',
        targetLocations: Array.isArray(p.targetLocations)
          ? p.targetLocations.join(', ')
          : p.targetLocations || '',
      });
    }
  }, [user]);

  // Calculate profile completeness based on real fields
  const calculateCompleteness = () => {
    const checks = [
      Boolean(formData.name?.trim()),
      Boolean(formData.preferredRole?.trim()),
      Boolean(formData.headline?.trim()),
      Boolean(formData.summary?.trim()),
      Boolean(formData.skills?.trim()),
      Boolean(formData.location?.trim() || formData.phone?.trim()),
      Boolean(formData.linkedin?.trim() || formData.github?.trim()),
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  };

  const completeness = calculateCompleteness();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const targetLocationsArray = formData.targetLocations
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name.trim(),
        profile: {
          headline: formData.headline.trim(),
          summary: formData.summary.trim(),
          phone: formData.phone.trim(),
          location: formData.location.trim(),
          linkedin: formData.linkedin.trim(),
          github: formData.github.trim(),
          portfolio: formData.portfolio.trim(),
          preferredRole: formData.preferredRole.trim(),
          workMode: formData.workMode,
          experienceLevel: formData.experienceLevel,
          employmentType: formData.employmentType,
          skills: skillsArray,
          targetLocations: targetLocationsArray,
        },
      };

      const res = await api.put('/auth/profile', payload);
      if (res.data?.user) {
        setUser(res.data.user);
      }
      toast.success('Profile changes saved successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Candidate Profile"
        description="Manage your professional background, skills, and target job preferences for automated matching."
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Profile' },
        ]}
      />

      {/* Profile Overview Card */}
      <Card className="p-6 border-[#E7E1F1] bg-[#FFFFFF] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#6845C5] text-white flex items-center justify-center text-2xl font-extrabold shrink-0 shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#26213A]">{user?.name}</h2>
                <Badge variant="neutral" size="sm">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-[#716B85]">
                @{user?.username} • {user?.email}
              </p>
              {formData.preferredRole && (
                <p className="text-xs font-semibold text-[#49316F] pt-0.5">
                  Target Role: <span className="text-[#6845C5] font-bold">{formData.preferredRole}</span>
                </p>
              )}
            </div>
          </div>

          {/* Profile Strength Indicator */}
          <div className="w-full sm:w-56 p-4 rounded-xl bg-[#F8F7FC] border border-[#DDD0FF] text-center shadow-2xs">
            <div className="flex justify-between items-center text-xs text-[#716B85] mb-1.5 font-semibold">
              <span>Profile Completeness</span>
              <span className="text-[#6845C5] font-extrabold">{completeness}%</span>
            </div>
            <div className="w-full bg-[#E7E1F1] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#6845C5] h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="text-[11px] text-[#918BA2] mt-1.5 font-medium">
              {completeness === 100
                ? 'All primary fields completed.'
                : 'Complete skills for higher matching accuracy.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Target Career & Matching Preferences */}
        <Card className="p-6 space-y-4 border-[#E7E1F1] bg-[#FFFFFF]">
          <div className="border-b border-[#E7E1F1] pb-3">
            <h3 className="text-sm font-bold text-[#26213A] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#6845C5]" />
              Career & Job Discovery Preferences
            </h3>
            <p className="text-xs text-[#716B85] mt-0.5">
              These preferences directly calibrate job compatibility scores and resume tailoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
                Preferred Job Title / Target Role
              </label>
              <input
                type="text"
                value={formData.preferredRole}
                onChange={(e) => setFormData({ ...formData, preferredRole: e.target.value })}
                className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                placeholder="e.g. Frontend Engineer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
                Work Mode Preference
              </label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all cursor-pointer shadow-xs"
              >
                <option value="any">Open to Any (Remote, Hybrid, On-site)</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid Preferred</option>
                <option value="on-site">On-site / Office</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
                Experience Level
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all cursor-pointer shadow-xs"
              >
                <option value="any">Not Specified</option>
                <option value="entry">Entry-level (0–2 years)</option>
                <option value="mid">Mid-level (3–5 years)</option>
                <option value="senior">Senior (5+ years)</option>
                <option value="lead">Staff / Lead / Principal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
                Target Locations (comma-separated)
              </label>
              <input
                type="text"
                value={formData.targetLocations}
                onChange={(e) => setFormData({ ...formData, targetLocations: e.target.value })}
                className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                placeholder="e.g. Remote, New York, London"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Contact Information */}
        <Card className="p-6 space-y-4 border-[#E7E1F1] bg-[#FFFFFF]">
          <div className="border-b border-[#E7E1F1] pb-3">
            <h3 className="text-sm font-bold text-[#26213A] flex items-center gap-2">
              <User className="w-4 h-4 text-[#6845C5]" />
              Personal & Contact Details
            </h3>
            <p className="text-xs text-[#716B85] mt-0.5">
              Used in the header of ATS-generated resumes and candidate summaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
                Full Name <span className="text-[#B83A52]">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
                Professional Headline
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                placeholder="e.g. Software Engineer specializing in distributed web services"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#918BA2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                  placeholder="e.g. +1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
                Current Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#918BA2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                  placeholder="e.g. Austin, TX"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: Professional Summary */}
        <Card className="p-6 space-y-4 border-[#E7E1F1] bg-[#FFFFFF]">
          <div className="border-b border-[#E7E1F1] pb-3">
            <h3 className="text-sm font-bold text-[#26213A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6845C5]" />
              Professional Summary
            </h3>
            <p className="text-xs text-[#716B85] mt-0.5">
              High-level overview of your background, career highlights, and technical strengths.
            </p>
          </div>

          <textarea
            rows={4}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl p-3.5 text-xs leading-relaxed text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all resize-y shadow-xs"
            placeholder="Write a concise overview of your experience, technical competencies, and achievements..."
          />
        </Card>

        {/* Section 4: Core Skills */}
        <Card className="p-6 space-y-4 border-[#E7E1F1] bg-[#FFFFFF]">
          <div className="border-b border-[#E7E1F1] pb-3">
            <h3 className="text-sm font-bold text-[#26213A] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#6845C5]" />
              Core Competencies & Skills
            </h3>
            <p className="text-xs text-[#716B85] mt-0.5">
              Comma-separated skills used to compute job compatibility and skill gaps.
            </p>
          </div>

          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all font-mono text-xs shadow-xs"
            placeholder="e.g. React, Node.js, TypeScript, PostgreSQL, Docker, AWS"
          />

          {formData.skills && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.skills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .map((skill, idx) => (
                  <Badge key={idx} variant="neutral" size="sm">
                    {skill}
                  </Badge>
                ))}
            </div>
          )}
        </Card>

        {/* Section 5: Web Links */}
        <Card className="p-6 space-y-4 border-[#E7E1F1] bg-[#FFFFFF]">
          <div className="border-b border-[#E7E1F1] pb-3">
            <h3 className="text-sm font-bold text-[#26213A] flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#6845C5]" />
              Online Profiles & Portfolio
            </h3>
            <p className="text-xs text-[#716B85] mt-0.5">
              Professional links included in resume exports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-xs text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                placeholder="linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
                GitHub URL
              </label>
              <input
                type="text"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-xs text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                placeholder="github.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
                Portfolio / Website
              </label>
              <input
                type="text"
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-xs text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                placeholder="https://..."
              />
            </div>
          </div>
        </Card>

        {/* Action Toolbar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" loading={loading}>
            <Check className="w-4 h-4 mr-1.5" />
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
