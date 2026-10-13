import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Eye, EyeOff, User, AtSign, Compass, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      toast.success('Account created! Welcome to Career Copilot.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E7E1F1] rounded-xl text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs';

  return (
    <div className="min-h-screen flex bg-[#F8F7FC] text-[#26213A] relative overflow-hidden">
      {/* Left panel — branding */}
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
            Start your targeted preparation journey.
          </h1>

          <p className="text-sm text-[#716B85] leading-relaxed">
            Create an account to analyze jobs, identify specific skill gaps, generate tailored ATS resumes, and find verified openings.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Transparent skill gap assessment',
              'Tailored technical & behavioral interview questions',
              'ATS-optimized vector PDF resume generator',
              'Live job discovery with direct application links',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-xs text-[#49316F] font-semibold bg-white/70 border border-[#E7E1F1] p-3 rounded-xl shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#6845C5] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — register form */}
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
              <h2 className="text-2xl font-bold text-[#26213A] tracking-tight">Create Account</h2>
              <p className="text-xs text-[#716B85] mt-1 font-medium">Get started with Career Copilot</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-[#26213A] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#918BA2] pointer-events-none" />
                  <input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    className={inputClass}
                    {...register('name', { required: 'Name is required' })}
                  />
                </div>
                {errors.name && <p className="text-xs text-[#B83A52] font-semibold mt-1">{errors.name.message}</p>}
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-xs font-semibold text-[#26213A] mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#918BA2] pointer-events-none" />
                  <input
                    id="username"
                    type="text"
                    placeholder="username"
                    className={inputClass}
                    {...register('username', {
                      required: 'Username is required',
                      minLength: { value: 3, message: 'At least 3 characters' },
                      pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers, underscores only' },
                    })}
                  />
                </div>
                {errors.username && <p className="text-xs text-[#B83A52] font-semibold mt-1">{errors.username.message}</p>}
              </div>

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
                    className={inputClass}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                    })}
                  />
                </div>
                {errors.email && <p className="text-xs text-[#B83A52] font-semibold mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-[#26213A] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#918BA2] pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E7E1F1] rounded-xl text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'At least 6 characters' },
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
                {errors.password && <p className="text-xs text-[#B83A52] font-semibold mt-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#26213A] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#918BA2] pointer-events-none" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={inputClass}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (val) => val === password || 'Passwords do not match',
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-[#B83A52] font-semibold mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                loading={isSubmitting}
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Create Account
              </Button>
            </form>

            <p className="text-center text-xs text-[#716B85] pt-2 border-t border-[#E7E1F1]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#6845C5] font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
