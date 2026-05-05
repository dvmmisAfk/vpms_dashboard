// components/ui/Select.jsx
import PropTypes from "prop-types";
import { forwardRef } from "react";

export const Select = forwardRef(function Select({ label, children, error, className = "", id, ...rest }, ref) {
  const inputId = id || rest.name || "vpms-select";

  return (
    <label className={`block text-left ${className}`} htmlFor={inputId}>
      {label ? <span className="mb-1 block text-xs font-semibold text-vpms-muted">{label}</span> : null}
      <select
        ref={ref}
        id={inputId}
        className={`w-full rounded-lg bg-vpms-surface px-3 py-2 text-sm text-vpms-text ring-1 ring-vpms-border focus:outline-none focus:ring-2 focus:ring-vpms-brand/40 ${error ? "ring-vpms-danger/60" : ""}`}
        {...rest}
      >
        {children}
      </select>
      {error ? <span className="mt-1 block text-xs text-vpms-danger">{error}</span> : null}
    </label>
  );
});

Select.displayName = "Select";

Select.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  children: PropTypes.node.isRequired,
};
