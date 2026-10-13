import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  action,
  className = '',
}) {
  return (
    <div className={`mb-6 md:mb-8 space-y-2.5 ${className}`}>
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-[#918BA2]" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="w-3 h-3 text-[#DDD0FF]" />}
              {crumb.href || crumb.to ? (
                <Link
                  to={crumb.href || crumb.to}
                  className="hover:text-[#6845C5] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#49316F] font-semibold">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#26213A] tracking-tight">{title}</h1>
          {description && (
            <p className="text-xs sm:text-sm text-[#716B85] mt-1 max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
