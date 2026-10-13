import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Compass } from 'lucide-react';
import authService from '../services/authService.js';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, data);
      toast.success('Password reset successfully! You are now logged in.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7FC] text-[#26213A] p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 space-y-6 bg-white border-[#E7E1F1] shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 bg-[#6845C5] rounded-xl flex items-center justify-center text-white shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#26213A]">Career Copilot</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#26213A] tracking-tight">Set New Password</h2>
            <p className="text-xs text-[#716B85] mt-1 font-medium">Choose a secure password for your account.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[#26213A] mb-1.5">
                New Password
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

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#26213A] mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#918BA2] pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E7E1F1] rounded-xl text-sm text-[#26213A] placeholder-[#918BA2] focus:outline-none focus:border-[#6845C5] focus:ring-2 focus:ring-[#9C83EC]/20 transition-all shadow-xs"
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

            <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
              Reset Password
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-[#E7E1F1]">
            <Link to="/login" className="text-xs font-bold text-[#6845C5] hover:text-[#5736AE] transition-colors">
              Return to Sign In
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
