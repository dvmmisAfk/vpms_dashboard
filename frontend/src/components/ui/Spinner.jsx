// components/ui/Spinner.jsx
import PropTypes from "prop-types";

export function Spinner({ className = "" }) {
  return <div className={`h-5 w-5 animate-spin rounded-full border-2 border-vpms-brand border-t-transparent ${className}`} role="status" aria-label="Loading" />;
}

Spinner.propTypes = {
  className: PropTypes.string,
};
