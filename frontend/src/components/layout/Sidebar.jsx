// components/layout/Sidebar.jsx
import { LayoutDashboard, Users, Calendar, Shield, ScanLine, BadgeCheck, Mail, FileText, LineChart, ClipboardList } from "lucide-react";
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { ROLES } from "../../utils/constants.js";

const linkBase =
  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-vpms-muted hover:bg-black/5 hover:text-vpms-text dark:hover:bg-white/5";

const active = "bg-black/5 text-vpms-text ring-1 ring-vpms-border dark:bg-white/10";

function Item({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink to={to} onClick={onClick} className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}>
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

Item.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export function Sidebar() {
  const { hasAnyRole, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    const nav = [];

    if (hasAnyRole([ROLES.ADMIN, ROLES.SECURITY, ROLES.EMPLOYEE])) nav.push({ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" });
    if (hasAnyRole([ROLES.ADMIN, ROLES.SECURITY])) nav.push({ to: "/visitors", icon: Users, label: "Visitors" });
    nav.push({ to: "/appointments", icon: Calendar, label: "Appointments" });

    if (hasAnyRole([ROLES.ADMIN, ROLES.SECURITY])) nav.push({ to: "/passes", icon: BadgeCheck, label: "Passes" });
    if (hasAnyRole([ROLES.SECURITY])) nav.push({ to: "/check-in", icon: ScanLine, label: "Check-In" });
    if (hasAnyRole([ROLES.SECURITY])) nav.push({ to: "/issue-pass", icon: Shield, label: "Issue Pass" });

    if (hasAnyRole([ROLES.EMPLOYEE])) nav.push({ to: "/invite", icon: Mail, label: "Invite Visitor" });
    if (hasAnyRole([ROLES.EMPLOYEE])) nav.push({ to: "/my-appointments", icon: Calendar, label: "My Appointments" });

    if (hasAnyRole([ROLES.ADMIN])) nav.push({ to: "/reports", icon: FileText, label: "Reports" });
    if (hasAnyRole([ROLES.ADMIN])) nav.push({ to: "/analytics", icon: LineChart, label: "Analytics" });
    if (hasAnyRole([ROLES.ADMIN])) nav.push({ to: "/users", icon: Users, label: "Users" });
    if (hasAnyRole([ROLES.ADMIN])) nav.push({ to: "/audit-logs", icon: ClipboardList, label: "Audit Logs" });

    if (hasAnyRole([ROLES.VISITOR])) nav.push({ to: "/my-pass", icon: BadgeCheck, label: "My Pass" });

    return nav;
  }, [hasAnyRole]);

  const close = () => setOpen(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-vpms-border bg-vpms-surface px-3 py-3 md:hidden">
        <div className="text-sm font-bold text-vpms-text">VPMS</div>
        <button type="button" className="rounded-lg bg-black/5 px-3 py-2 text-sm font-semibold dark:bg-white/10" onClick={() => setOpen((v) => !v)}>
          Menu
        </button>
      </div>

      <aside className={`${open ? "fixed inset-0 z-50 flex" : "hidden"} md:flex`}>
        {open ? (
          <button type="button" className="absolute inset-0 bg-black/50 md:hidden" aria-label="Close menu" onClick={close} />
        ) : null}

        <div className="relative m-0 flex h-full w-[280px] max-w-[85vw] flex-col border-r border-vpms-border bg-vpms-surface md:static md:m-0 md:max-w-none">
          <div className="border-b border-vpms-border px-4 py-4">
            <div className="text-lg font-black tracking-tight text-vpms-text">VPMS</div>
            <div className="mt-1 text-xs text-vpms-muted">Visitor Pass Management</div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
            {items.map((it) => (
              <Item key={it.to} to={it.to} icon={it.icon} label={it.label} onClick={close} />
            ))}
          </nav>

          <div className="border-t border-vpms-border p-3">
            <div className="mb-2 rounded-lg bg-vpms-bg p-3 text-left">
              <div className="text-xs font-semibold text-vpms-text">{user?.name}</div>
              <div className="text-[11px] text-vpms-muted">{user?.role}</div>
            </div>
            <button type="button" className="w-full rounded-lg bg-black/5 px-3 py-2 text-sm font-semibold hover:bg-black/10 dark:bg-white/10" onClick={() => logout()}>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
