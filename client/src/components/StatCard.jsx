export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  className = '',
}) {
  return (
    <div
      className={`bg-white border border-[#E7E1F1] rounded-2xl p-5 hover:border-[#B69AF5] hover:shadow-md hover:shadow-[#49316F]/6 hover:-translate-y-0.5 transition-all duration-200 shadow-sm shadow-[#49316F]/4 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-[#716B85] uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-[#F2EDFC] border border-[#DDD0FF] flex items-center justify-center text-[#6845C5]">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-bold text-[#26213A] tracking-tight">{value}</div>
        {subtext && <p className="text-xs text-[#918BA2] mt-1 font-normal leading-relaxed">{subtext}</p>}
      </div>
    </div>
  );
}

export default StatCard;
