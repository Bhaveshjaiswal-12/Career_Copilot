export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  className = '',
}) {
  const variants = {
    neutral: 'bg-[#F1EDF9] text-[#716B85] border border-[#E7E1F1]',
    elevated: 'bg-[#F2EDFC] text-[#49316F] border border-[#DDD0FF] font-semibold',
    primary: 'bg-[#6845C5] text-white font-semibold',
    success: 'bg-[#E8F5EE] text-[#247A57] border border-[#A8DEC5] font-medium',
    warning: 'bg-[#FDF6E9] text-[#94621B] border border-[#F0D5A8] font-medium',
    danger: 'bg-[#FDF0F3] text-[#B83A52] border border-[#F2BDC9] font-medium',
    info: 'bg-[#F2EDFC] text-[#6845C5] border border-[#DDD0FF] font-medium',
    outline: 'bg-transparent text-[#716B85] border border-[#E7E1F1]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 rounded-md',
    md: 'text-xs px-2.5 py-1 gap-1.5 rounded-lg',
    lg: 'text-sm px-3 py-1.5 gap-2 rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center font-medium tracking-wide ${
        variants[variant] || variants.neutral
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}

export default Badge;
