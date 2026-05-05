// components/ui/Badge.jsx
import PropTypes from "prop-types";

import { VISITOR_STATUSES, ROLES } from "../../utils/constants.js";

const ROLE_COLORS = {
  [ROLES.ADMIN]: "bg-purple-600/15 text-purple-700 dark:text-purple-200 ring-purple-600/25",
  [ROLES.SECURITY]: "bg-indigo-600/15 text-indigo-700 dark:text-indigo-200 ring-indigo-600/25",
  [ROLES.EMPLOYEE]: "bg-sky-600/15 text-sky-700 dark:text-sky-200 ring-sky-600/25",
  [ROLES.VISITOR]: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-200 ring-emerald-600/25",
};

const STATUS_COLORS = {
  [VISITOR_STATUSES.PENDING]: "bg-amber-600/15 text-amber-800 dark:text-amber-200 ring-amber-600/25",
  [VISITOR_STATUSES.APPROVED]: "bg-blue-600/15 text-blue-800 dark:text-blue-200 ring-blue-600/25",
  [VISITOR_STATUSES.CHECKED_IN]: "bg-emerald-600/15 text-emerald-800 dark:text-emerald-200 ring-emerald-600/25",
  [VISITOR_STATUSES.CHECKED_OUT]: "bg-slate-600/15 text-slate-800 dark:text-slate-200 ring-slate-600/25",
  [VISITOR_STATUSES.REJECTED]: "bg-red-600/15 text-red-800 dark:text-red-200 ring-red-600/25",
};

export function Badge({ children, variant = "neutral", value }) {
  const cls =
    variant === "role"
      ? ROLE_COLORS[value] || "bg-black/5 text-vpms-text ring-vpms-border"
      : variant === "status"
        ? STATUS_COLORS[value] || "bg-black/5 text-vpms-text ring-vpms-border"
        : "bg-black/5 text-vpms-text ring-vpms-border";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ring-inset ${cls}`}>{children}</span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["neutral", "role", "status"]),
  value: PropTypes.string,
};
