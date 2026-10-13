export function Card({
  children,
  className = '',
  hover = false,
  bordered = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 md:p-6 transition-all duration-200 shadow-sm shadow-[#49316F]/5 ${
        bordered ? 'border border-[#E7E1F1]' : ''
      } ${
        hover ? 'hover:border-[#B69AF5] hover:shadow-md hover:shadow-[#49316F]/8 hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div>
        {title && <h3 className="text-base sm:text-lg font-bold text-[#26213A] tracking-tight">{title}</h3>}
        {description && <p className="text-xs sm:text-sm text-[#716B85] mt-0.5 leading-relaxed">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default Card;
