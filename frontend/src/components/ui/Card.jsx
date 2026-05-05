// components/ui/Card.jsx
import PropTypes from "prop-types";

export function Card({ title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`rounded-xl bg-vpms-surface p-4 shadow-sm ring-1 ring-vpms-border ${className}`}>
      {(title || actions) && (
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h3 className="text-base font-semibold text-vpms-text">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm text-vpms-muted">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

Card.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
