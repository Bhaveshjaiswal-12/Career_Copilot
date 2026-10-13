import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8F7FC] text-[#26213A] relative overflow-hidden">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative z-10 p-12 border-r border-[#E7E1F1] bg-gradient-to-br from-[#F1EDF9] via-[#F8F7FC] to-[#DDD0FF]/40">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md space-y-7"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#6845C5] rounded-2xl flex items-center justify-center text-white shadow-sm">
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#26213A]">
              Career Copilot
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-[#26213A] leading-tight">
            Turn any job description into your career game plan.
          </h1>

          <p className="text-sm text-[#716B85] leading-relaxed">
            AI-powered skill gap analysis, customized interview preparation, real verified job discovery, and ATS-optimized resume tailoring — all on one unified platform.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/80 border border-[#E7E1F1] shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#49316F]">
                <CheckCircle2 className="w-4 h-4 text-[#6845C5]" /> Verified Matching
              </div>
              <p className="text-[11px] text-[#716B85]">Live Arbeitnow job feed with compatibility scoring</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 border border-[#E7E1F1] shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#49316F]">
                <Sparkles className="w-4 h-4 text-[#6845C5]" /> Direct ATS Export
              </div>
              <p className="text-[11px] text-[#716B85]">High-fidelity PDF resume optimized for parsers</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-6 bg-[#F8F7FC]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 space-y-6 bg-white border-[#E7E1F1] shadow-sm">
            {/* Mobile logo header */}
            <div className="lg:hidden flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 bg-[#6845C5] rounded-xl flex items-center justify-center text-white shadow-xs">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[#26213A]">Career Copilot</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#26213A] tracking-tight">Sign In</h2>
              <p className="text-xs text-[#716B85] mt-1 font-medium">Access your saved reports, practice questions, and job discovery</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[#26213A] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#918BA2] pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E7E1F1] rounded-xl text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-[#B83A52] font-semibold mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold text-[#26213A]">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#716B85] hover:text-[#6845C5] font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#918BA2] pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E7E1F1] rounded-xl text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                    {...register('password', {
                      required: 'Password is required',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#918BA2] hover:text-[#26213A] transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-[#B83A52] font-semibold mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                loading={isSubmitting}
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign In
              </Button>
            </form>

            <p className="text-center text-xs text-[#716B85] pt-2 border-t border-[#E7E1F1]">
              Don&apos;t have an account yet?{' '}
              <Link to="/register" className="text-[#6845C5] font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
