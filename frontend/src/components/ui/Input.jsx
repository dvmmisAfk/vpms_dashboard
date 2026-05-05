// components/ui/Input.jsx
import PropTypes from "prop-types";
import { forwardRef } from "react";

export const Input = forwardRef(function Input({ label, hint, error, className = "", id, ...rest }, ref) {
  const inputId = id || rest.name || "vpms-field";

  return (
    <label className={`block text-left ${className}`} htmlFor={inputId}>
      {label ? <span className="mb-1 block text-xs font-semibold text-vpms-muted">{label}</span> : null}

      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-lg bg-vpms-surface px-3 py-2 text-sm text-vpms-text ring-1 ring-vpms-border placeholder:text-vpms-muted focus:outline-none focus:ring-2 focus:ring-vpms-brand/40 ${error ? "ring-vpms-danger/60" : ""}`}
        {...rest}
      />

      {hint && !error ? <span className="mt-1 block text-xs text-vpms-muted">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs text-vpms-danger">{error}</span> : null}
    </label>
  );
});

Input.displayName = "Input";

Input.propTypes = {
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
};
