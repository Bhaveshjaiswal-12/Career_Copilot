import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-160 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9C83EC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F7FC] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary:
      'bg-[#6845C5] text-white font-semibold hover:bg-[#5736AE] active:scale-[0.98] shadow-sm shadow-[#6845C5]/25 hover:shadow-md hover:shadow-[#6845C5]/30',
    secondary:
      'bg-white text-[#26213A] border border-[#E7E1F1] hover:bg-[#F2EDFC] hover:border-[#DDD0FF] hover:text-[#49316F] active:scale-[0.98] shadow-xs',
    elevated:
      'bg-[#F2EDFC] text-[#49316F] border border-[#DDD0FF] hover:bg-[#EAE2FA] hover:border-[#B69AF5] active:scale-[0.98]',
    outline:
      'bg-transparent text-[#49316F] border border-[#DDD0FF] hover:bg-[#F2EDFC] active:scale-[0.98]',
    ghost:
      'bg-transparent text-[#716B85] hover:bg-[#F2EDFC] hover:text-[#49316F]',
    danger:
      'bg-white text-[#B83A52] border border-[#F2BDC9] hover:bg-[#FDF0F3] hover:border-[#B83A52]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2 gap-2 rounded-xl',
    lg: 'text-base px-5 py-2.5 gap-2.5 rounded-xl',
    icon: 'p-2 aspect-square rounded-xl',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
});

export default Button;
