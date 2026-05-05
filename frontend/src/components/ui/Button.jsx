// components/ui/Button.jsx
import PropTypes from "prop-types";

const variantClasses = {
  primary:
    "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:opacity-60",
  secondary:
    "bg-vpms-surface text-vpms-text ring-1 ring-vpms-border hover:bg-white/70 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-vpms-brand/30 disabled:opacity-60",
  danger:
    "bg-vpms-danger text-white hover:opacity-95 focus-visible:ring-2 focus-visible:ring-vpms-danger/40 disabled:opacity-60",
  ghost:
    "bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-vpms-text disabled:opacity-60",
};

export function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  loading = false,
  disabled,
  ...rest
}) {
  const v = variantClasses[variant] || variantClasses.primary;
  const isDisabled = disabled || loading;

  return (
    <button type={type} className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold shadow-sm transition ${v} ${className}`} disabled={isDisabled} {...rest}>
      {loading ? <span className="animate-pulse">Working...</span> : children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "ghost"]),
  className: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};
