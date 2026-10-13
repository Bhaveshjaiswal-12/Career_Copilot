import Button from './Button.jsx';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionLink,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) {
  return (
    <div
      className={`bg-white/90 border border-dashed border-[#DDD0FF] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto flex flex-col items-center justify-center shadow-sm shadow-[#49316F]/4 ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#F2EDFC] border border-[#DDD0FF] flex items-center justify-center text-[#6845C5] mb-4 shadow-xs">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-bold text-[#26213A] tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-[#716B85] mt-1.5 max-w-md leading-relaxed">{description}</p>
      )}

      {(actionText || secondaryActionText) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {actionText && (
            actionLink ? (
              <a href={actionLink} className="inline-block">
                <Button variant="primary">{actionText}</Button>
              </a>
            ) : (
              <Button variant="primary" onClick={onAction}>
                {actionText}
              </Button>
            )
          )}
          {secondaryActionText && (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
