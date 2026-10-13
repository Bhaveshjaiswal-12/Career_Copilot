import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  ArrowLeft,
  ArrowRight,
  X,
  Loader2,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Clock,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import api from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Badge } from '../components/Badge.jsx';

const STEPS = [
  { id: 'resume', title: 'Resume Document', subtitle: 'Upload your current PDF resume' },
  { id: 'job', title: 'Target Role', subtitle: 'Paste the job description and details' },
  { id: 'details', title: 'Additional Context', subtitle: 'Optional achievements and notes' },
];

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
              i < currentStep
                ? 'bg-[#F2EDFC] text-[#6845C5] border-[#DDD0FF]'
                : i === currentStep
                ? 'bg-[#6845C5] text-white border-[#6845C5] ring-4 ring-[#DDD0FF]/70 shadow-sm'
                : 'bg-white text-[#918BA2] border-[#E7E1F1]'
            }`}
          >
            {i < currentStep ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : i + 1}
          </div>
          <div className="hidden sm:block text-left">
            <span
              className={`text-xs font-semibold block leading-tight ${
                i === currentStep ? 'text-[#26213A]' : 'text-[#716B85]'
              }`}
            >
              {step.title}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-8 sm:w-12 h-0.5 rounded-full transition-colors ${
                i < currentStep ? 'bg-[#6845C5]' : 'bg-[#E7E1F1]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function FileDropZone({ file, onFile, onRemove }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');

  const validateAndSetFile = (f) => {
    setFileError('');
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.endsWith('.pdf')) {
      const err = 'Only PDF resume documents are supported.';
      setFileError(err);
      toast.error(err);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      const err = 'File size exceeds the 5MB limit. Please upload a smaller PDF.';
      setFileError(err);
      toast.error(err);
      return;
    }
    onFile(f);
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      validateAndSetFile(f);
    },
    [onFile]
  );

  const handleInput = (e) => {
    const f = e.target.files[0];
    validateAndSetFile(f);
  };

  if (file) {
    return (
      <div className="bg-[#FFFFFF] border border-[#DDD0FF] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 bg-[#F2EDFC] border border-[#DDD0FF] rounded-xl flex items-center justify-center shrink-0 text-[#6845C5]">
          <FileText className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[#26213A] truncate">{file.name}</div>
          <div className="text-xs text-[#716B85]">{(file.size / 1024).toFixed(1)} KB • PDF document</div>
        </div>
        <button
          onClick={onRemove}
          className="text-[#918BA2] hover:text-[#B83A52] p-2 rounded-lg border border-transparent hover:border-[#E7E1F1] hover:bg-[#F8F7FC] transition-colors cursor-pointer"
          aria-label="Remove resume file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`bg-[#F8F7FC] border-2 border-dashed rounded-2xl p-10 transition-all text-center cursor-pointer ${
          dragActive
            ? 'border-[#6845C5] bg-[#F2EDFC]/60 scale-[1.01]'
            : 'border-[#DDD0FF] hover:border-[#6845C5] hover:bg-[#F2EDFC]/30'
        }`}
        onClick={() => document.getElementById('resume-upload').click()}
      >
        <div className="w-12 h-12 rounded-xl bg-[#F2EDFC] border border-[#DDD0FF] text-[#6845C5] flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-[#26213A] mb-1">
          Drop your PDF resume here or click to browse
        </p>
        <p className="text-xs text-[#716B85]">Accepts PDF files up to 5MB</p>
        <input
          id="resume-upload"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleInput}
        />
      </div>
      {fileError && <p className="text-xs text-[#B83A52] font-semibold">{fileError}</p>}
    </div>
  );
}

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selfDescription, setSelfDescription] = useState('');

  // Processing & Error states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiErrorState, setAiErrorState] = useState(null); // { code, message, guidance, retryable }

  const canProceed = () => {
    if (step === 0) return true; // Resume optional
    if (step === 1) return jobDescription.trim().length >= 20;
    if (step === 2) return true; // Context optional
    return false;
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiErrorState(null);

    try {
      const formData = new FormData();
      if (resumeFile) formData.append('resume', resumeFile);
      if (jobTitle.trim()) formData.append('jobTitle', jobTitle.trim());
      if (companyName.trim()) formData.append('companyName', companyName.trim());
      formData.append('jobDescription', jobDescription.trim());
      if (selfDescription.trim()) formData.append('selfDescription', selfDescription.trim());

      const res = await api.post('/interview/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      toast.success('Analysis completed successfully!');
      navigate(`/reports/${res.data.data._id}`);
    } catch (err) {
      console.error('Analysis error:', err);

      const errCode = err.code || err.response?.data?.code || 'AI_GENERIC_ERROR';
      const errMsg = err.message || err.response?.data?.message || 'Analysis request could not be processed.';
      const errDetails = err.details || err.response?.data?.details;

      const isQuota =
        errCode === 'AI_QUOTA_EXHAUSTED' ||
        errCode === 'AI_RATE_LIMITED' ||
        errMsg.toLowerCase().includes('quota') ||
        errMsg.toLowerCase().includes('rate limit');

      setAiErrorState({
        code: errCode,
        message: errMsg,
        guidance:
          errDetails?.userGuidance ||
          (isQuota
            ? 'The AI service has temporarily reached its rate or quota limit. Your job description and uploaded resume are saved below so you will not lose your work.'
            : 'An error occurred during AI processing. Your form inputs remain intact.'),
        retryable: errDetails ? errDetails.retryable : true,
      });

      toast.error(isQuota ? 'AI service limit reached' : 'Analysis request failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Resume & Job Description Analysis"
        description="Extract skill gaps, tailored interview questions, preparation roadmaps, and ATS compatibility."
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'New Analysis' },
        ]}
      />

      {/* AI Error Alert Banner if an error occurred */}
      {aiErrorState && (
        <Card className="p-5 border-[#E7E1F1] bg-[#FFFFFF] shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#B83A52]/10 text-[#B83A52] shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#26213A]">
                  {aiErrorState.code === 'AI_QUOTA_EXHAUSTED'
                    ? 'AI Service Limit Reached'
                    : aiErrorState.code === 'AI_RATE_LIMITED'
                    ? 'AI Rate Limit Exceeded'
                    : 'Analysis Could Not Be Completed'}
                </h3>
                <Badge variant="outline" size="sm">
                  {aiErrorState.code}
                </Badge>
              </div>
              <p className="text-xs text-[#716B85] leading-relaxed">
                {aiErrorState.message}
              </p>
              <p className="text-xs text-[#49316F] font-medium leading-relaxed">
                {aiErrorState.guidance}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E7E1F1] flex items-center justify-end gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAiErrorState(null)}
            >
              Dismiss
            </Button>
            {aiErrorState.retryable && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Retry Analysis
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Analyzing Progress Panel */}
      {isAnalyzing ? (
        <Card className="p-12 text-center border-[#E7E1F1] bg-[#FFFFFF] shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-[#F2EDFC] border border-[#DDD0FF] flex items-center justify-center mx-auto mb-4 text-[#6845C5] shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-[#26213A] mb-1">
            Analyzing Document & Job Requirements
          </h2>
          <p className="text-xs text-[#716B85] max-w-md mx-auto mb-6 leading-relaxed">
            Evaluating skill alignment, parsing technical responsibilities, generating practice questions, and constructing your preparation roadmap.
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F8F7FC] border border-[#E7E1F1] text-xs font-medium text-[#716B85]">
            <Clock className="w-3.5 h-3.5 text-[#6845C5]" />
            <span>Estimated time: 15–30 seconds</span>
          </div>
        </Card>
      ) : (
        <>
          <StepIndicator currentStep={step} />

          <Card className="p-7">
            <AnimatePresence mode="wait">
              {/* Step 0: Resume Upload */}
              {step === 0 && (
                <motion.div
                  key="resume"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-[#26213A] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#6845C5]" />
                      1. Upload Resume Document
                    </h2>
                    <p className="text-xs text-[#716B85]">
                      Upload your PDF resume so the AI can compare your real experience against the job requirements.
                    </p>
                  </div>

                  <FileDropZone
                    file={resumeFile}
                    onFile={setResumeFile}
                    onRemove={() => setResumeFile(null)}
                  />

                  <div className="p-4 rounded-xl bg-[#F2EDFC]/60 border border-[#DDD0FF] flex items-start gap-3 text-xs text-[#49316F]">
                    <HelpCircle className="w-4 h-4 shrink-0 text-[#6845C5] mt-0.5" />
                    <span className="leading-relaxed">
                      Resume upload is optional. If skipped, the analysis will evaluate general candidate criteria and your saved profile skills.
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Target Role & Job Description */}
              {step === 1 && (
                <motion.div
                  key="job"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-[#26213A] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#6845C5]" />
                      2. Target Role & Job Description
                    </h2>
                    <p className="text-xs text-[#716B85]">
                      Provide the position title, company name, and full job posting text.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
                        Target Job Title (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Frontend Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl px-3.5 py-2.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#26213A] mb-1.5">
                      Job Description <span className="text-[#B83A52]">* (min 20 chars)</span>
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the complete job posting, required qualifications, and key responsibilities here..."
                      rows={9}
                      className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl p-3.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all resize-y font-mono text-xs leading-relaxed shadow-xs"
                    />
                    <div className="flex justify-between items-center text-xs text-[#716B85] mt-1.5">
                      <span>{jobDescription.length} characters</span>
                      {jobDescription.trim().length > 0 && jobDescription.trim().length < 20 && (
                        <span className="text-[#B83A52] font-semibold">
                          Please enter at least 20 characters
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Additional Context */}
              {step === 2 && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-[#26213A] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#6845C5]" />
                      3. Additional Candidate Context
                    </h2>
                    <p className="text-xs text-[#716B85]">
                      Optional: mention recent projects, unlisted certifications, or career goals to enrich the evaluation.
                    </p>
                  </div>

                  <textarea
                    value={selfDescription}
                    onChange={(e) => setSelfDescription(e.target.value)}
                    placeholder="e.g. Recently transitioned from Python to TypeScript; led a migration of our frontend to Next.js; looking to highlight distributed systems experience."
                    rows={5}
                    className="w-full bg-[#FFFFFF] border border-[#E7E1F1] rounded-xl p-3.5 text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all resize-y text-xs leading-relaxed shadow-xs"
                  />

                  {/* Summary of what will be generated */}
                  <div className="p-5 rounded-2xl bg-[#F8F7FC] border border-[#DDD0FF] space-y-3">
                    <span className="text-xs font-bold text-[#49316F] uppercase tracking-wider block">
                      Analysis Output Summary
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#716B85]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#6845C5]" />
                        <span className="text-[#26213A] font-medium">Candidate & Role Summaries</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#6845C5]" />
                        <span className="text-[#26213A] font-medium">Overall Compatibility Score</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#6845C5]" />
                        <span className="text-[#26213A] font-medium">Strong, Partial & Missing Skills</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#6845C5]" />
                        <span className="text-[#26213A] font-medium">Technical Interview Questions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#6845C5]" />
                        <span className="text-[#26213A] font-medium">Behavioral Interview Questions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#6845C5]" />
                        <span className="text-[#26213A] font-medium">Structured Preparation Roadmap</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#E7E1F1]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Previous Step
              </Button>

              {step < 2 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed()}
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={!canProceed() || isAnalyzing}
                >
                  Start AI Analysis
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
