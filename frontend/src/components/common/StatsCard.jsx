// components/common/StatsCard.jsx
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import PropTypes from "prop-types";

export function StatsCard({ icon: Icon, title, value, deltaLabel, trend = "flat" }) {
  const trendIcon = trend === "up" ? <ArrowUpRight size={16} /> : trend === "down" ? <ArrowDownRight size={16} /> : null;
  const trendColor =
    trend === "up" ? "text-emerald-600 dark:text-emerald-300" : trend === "down" ? "text-red-600 dark:text-red-300" : "text-vpms-muted";

  return (
    <div className="rounded-xl bg-vpms-surface p-4 shadow-sm ring-1 ring-vpms-border">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-vpms-muted">{title}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-vpms-text">{value}</div>
          {deltaLabel ? (
            <div className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
              {trendIcon}
              <span>{deltaLabel}</span>
            </div>
          ) : null}
        </div>
        {Icon ? (
          <div className="rounded-xl bg-vpms-bg p-2 ring-1 ring-vpms-border">
            <Icon size={20} className="text-vpms-brand" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

StatsCard.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  deltaLabel: PropTypes.string,
  trend: PropTypes.oneOf(["up", "down", "flat"]),
};
