import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Compass } from 'lucide-react';
import authService from '../services/authService.js';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data);
      setSent(true);
      toast.success('If an account exists, a reset link has been sent.');
    } catch (err) {
      toast.error(err.message || 'Failed to send password reset request.');
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

          {!sent ? (
            <>
              <div>
                <h2 className="text-2xl font-bold text-[#26213A] tracking-tight">Forgot Password</h2>
                <p className="text-xs text-[#716B85] mt-1 font-medium">
                  Enter your registered email address and we will generate a recovery link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  {errors.email && <p className="text-xs text-[#B83A52] font-semibold mt-1">{errors.email.message}</p>}
                </div>

                <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
                  Send Password Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-[#F2EDFC] rounded-2xl flex items-center justify-center mx-auto border border-[#DDD0FF] text-[#6845C5] shadow-xs">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#26213A]">Check Your Email</h2>
              <p className="text-xs text-[#716B85] leading-relaxed">
                If an account with that email exists in our records, a secure reset token has been dispatched.
              </p>
            </div>
          )}

          <div className="text-center pt-2 border-t border-[#E7E1F1]">
            <Link
              to="/login"
              className="text-xs font-bold text-[#6845C5] hover:text-[#5736AE] transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
