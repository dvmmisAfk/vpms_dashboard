// components/layout/PageHeader.jsx
import PropTypes from "prop-types";

export function PageHeader({ title, subtitle, breadcrumbs = [], actions }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumbs?.length ? (
          <div className="mb-2 text-xs text-vpms-muted">
            {breadcrumbs.map((b, idx) => (
              <span key={b}>
                {idx > 0 ? <span className="mx-2">/</span> : null}
                <span className="font-medium">{b}</span>
              </span>
            ))}
          </div>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-vpms-text">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm text-vpms-muted">{subtitle}</p> : null}
      </div>

      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  breadcrumbs: PropTypes.arrayOf(PropTypes.string),
  actions: PropTypes.node,
};
