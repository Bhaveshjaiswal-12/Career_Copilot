import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Compass,
  ArrowRight,
  FileText,
  Brain,
  Target,
  CheckCircle2,
  BarChart3,
  MessageSquare,
  Route,
  Upload,
  Shield,
  Briefcase,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

/* ─── Animated section wrapper ─── */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Workflow visual ─── */
function WorkflowVisual() {
  const steps = [
    { icon: Upload, label: 'Upload PDF Resume' },
    { icon: FileText, label: 'Target Job Posting' },
    { icon: Brain, label: 'AI Gap Analysis' },
    { icon: Target, label: 'Interview Question Bank' },
    { icon: Briefcase, label: 'Live Job Discovery' },
    { icon: FileText, label: 'ATS Vector Resume' },
  ];

  return (
    <div className="flex flex-col items-center gap-2.5">
      {steps.map((step, i) => (
        <motion.div
          key={step.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
        >
          <div className="flex items-center gap-3 bg-[#F8F7FC] border border-[#DDD0FF] rounded-xl px-5 py-3 min-w-[240px] shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-[#F2EDFC] text-[#6845C5] flex items-center justify-center shrink-0">
              <step.icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#26213A]">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-0.5 h-3 bg-[#DDD0FF] mx-auto rounded-full" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Nav ─── */
function Navbar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#E7E1F1]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#6845C5] rounded-xl flex items-center justify-center text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-[#26213A]">Career Copilot</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#716B85]">
          <a href="#features" className="hover:text-[#6845C5] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#6845C5] transition-colors">Workflow</a>
          <a href="#discovery" className="hover:text-[#6845C5] transition-colors">Job Discovery</a>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="text-xs bg-[#6845C5] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#5736AE] transition-all shadow-xs flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-semibold text-[#716B85] hover:text-[#26213A] transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs bg-[#6845C5] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#5736AE] transition-all shadow-xs"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: BarChart3,
      title: 'Skill Gap Analysis',
      desc: 'Transparently evaluate which competencies you have, which are partial, and which are missing against actual role criteria.',
    },
    {
      icon: Briefcase,
      title: 'Real Job Discovery',
      desc: 'Search live verified tech openings with direct application URLs and instant resume compatibility scoring.',
    },
    {
      icon: MessageSquare,
      title: 'Interview Preparation',
      desc: 'Role-specific technical challenges and behavioral questions formatted around the STAR method.',
    },
    {
      icon: Route,
      title: 'Structured Roadmap',
      desc: 'A prioritized day-by-day study and task checklist designed to bridge specific skill deficiencies.',
    },
    {
      icon: FileText,
      title: 'ATS Resume Tailoring',
      desc: 'Generate tailored ATS-compliant resumes with real highlights without inventing false experience.',
    },
    {
      icon: Shield,
      title: 'Privacy & Data Export',
      desc: 'Your data is strictly yours. Export your full profile, reports, and saved jobs in standard JSON format anytime.',
    },
  ];

  const howSteps = [
    { num: '01', title: 'Upload PDF Resume', desc: 'Securely upload your existing PDF resume to extract skills and achievements.', icon: Upload },
    { num: '02', title: 'Paste Job Posting', desc: 'Provide the job description for the specific position or search open roles.', icon: FileText },
    { num: '03', title: 'AI Match & Gap Evaluation', desc: 'Receive structured skill gap metrics, interview questions, and prep roadmap.', icon: Brain },
    { num: '04', title: 'Export & Apply', desc: 'Download a clean ATS-optimized PDF resume and apply with confidence.', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#26213A] selection:bg-[#F2EDFC] selection:text-[#6845C5]">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 border-b border-[#E7E1F1]">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#DDD0FF] bg-[#F2EDFC] text-xs font-bold text-[#6845C5]">
                <Compass className="w-3.5 h-3.5" />
                AI Career Intelligence & ATS Platform
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#26213A] leading-[1.1]">
                Turn any job description into your career game plan.
              </h1>

              <p className="text-sm md:text-base text-[#716B85] leading-relaxed max-w-lg">
                Upload your resume and paste a target job description to instantly analyze skill gaps, generate tailored technical and behavioral interview questions, discover aligned job openings, and customize an ATS-compliant resume.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-2 bg-[#6845C5] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5736AE] transition-all text-sm shadow-xs hover:shadow"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/analyze"
                      className="inline-flex items-center gap-2 bg-white border border-[#E7E1F1] text-[#26213A] font-semibold px-5 py-3 rounded-xl hover:bg-[#F2EDFC] transition-colors text-sm shadow-2xs"
                    >
                      New Analysis
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 bg-[#6845C5] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5736AE] transition-all text-sm shadow-xs hover:shadow"
                    >
                      Start Free Analysis <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="#how-it-works"
                      className="inline-flex items-center gap-2 bg-white border border-[#E7E1F1] text-[#26213A] font-semibold px-5 py-3 rounded-xl hover:bg-[#F2EDFC] transition-colors text-sm shadow-2xs"
                    >
                      View Workflow
                    </a>
                  </>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium text-[#716B85]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#6845C5]" />
                  No fabricated claims
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#6845C5]" />
                  Live verified job board
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#6845C5]" />
                  Exportable ATS vector PDFs
                </div>
              </div>
            </motion.div>

            {/* Right — Clean architectural preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:flex justify-center"
            >
              <div className="bg-white border border-[#E7E1F1] rounded-2xl p-8 shadow-sm">
                <WorkflowVisual />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 border-b border-[#E7E1F1] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16 space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#6845C5] font-bold">
                Platform Capabilities
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#26213A] tracking-tight">
                Engineered for serious career preparation
              </h2>
              <p className="text-xs sm:text-sm text-[#716B85] max-w-xl mx-auto">
                Everything you need from evaluating a role to practicing targeted questions and generating export-ready resumes.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="bg-[#FFFFFF] border border-[#E7E1F1] rounded-2xl p-6 hover:border-[#DDD0FF] hover:shadow-md transition-all h-full space-y-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F2EDFC] border border-[#DDD0FF] flex items-center justify-center text-[#6845C5] shadow-xs">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#26213A]">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-[#716B85] leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 border-b border-[#E7E1F1] bg-[#F8F7FC]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16 space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#6845C5] font-bold">
                Process
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#26213A] tracking-tight">
                Four steps to an interview-ready application
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howSteps.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.1}>
                <div className="bg-white border border-[#E7E1F1] rounded-2xl p-6 space-y-3.5 shadow-sm h-full">
                  <div className="text-2xl font-black text-[#DDD0FF] font-mono">{s.num}</div>
                  <div className="w-9 h-9 rounded-xl bg-[#F2EDFC] flex items-center justify-center text-[#6845C5]">
                    <s.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#26213A]">{s.title}</h3>
                  <p className="text-xs text-[#716B85] leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── JOB DISCOVERY HIGHLIGHT ─── */}
      <section id="discovery" className="py-24 border-b border-[#E7E1F1] bg-gradient-to-br from-[#F1EDF9] via-[#F8F7FC] to-[#DDD0FF]/40">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <Reveal>
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest text-[#6845C5] font-bold">
                Live Openings
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#26213A] tracking-tight">
                Discover positions matched against your skills
              </h2>
              <p className="text-xs sm:text-sm text-[#716B85] max-w-xl mx-auto leading-relaxed">
                Connect your profile with live verified tech jobs. Understand why positions are recommended, which skills match, and apply directly on the hiring company&apos;s site.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="pt-2">
              <Link
                to={isAuthenticated ? "/jobs" : "/register"}
                className="inline-flex items-center gap-2 bg-[#6845C5] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5736AE] transition-all text-sm shadow-xs hover:shadow"
              >
                Explore Live Jobs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-12 bg-white border-t border-[#E7E1F1]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#716B85]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#6845C5] rounded-lg flex items-center justify-center text-white">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-[#26213A]">Career Copilot</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Career Copilot. All rights reserved.</p>
          <div className="flex gap-4 font-medium">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-[#6845C5] transition-colors">Dashboard</Link>
                <Link to="/analyze" className="hover:text-[#6845C5] transition-colors">New Analysis</Link>
                <Link to="/jobs" className="hover:text-[#6845C5] transition-colors">Job Discovery</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-[#6845C5] transition-colors">Sign In</Link>
                <Link to="/register" className="hover:text-[#6845C5] transition-colors">Register</Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
