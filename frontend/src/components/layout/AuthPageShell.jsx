// components/layout/AuthPageShell.jsx
import PropTypes from "prop-types";

export function AuthPageShell({ children, contentClassName = "max-w-md" }) {
  return (
    <div className="min-h-screen bg-vpms-bg px-4 py-10">
      <div className={`mx-auto w-full ${contentClassName}`}>{children}</div>
    </div>
  );
}

AuthPageShell.propTypes = {
  children: PropTypes.node.isRequired,
  contentClassName: PropTypes.string,
};
