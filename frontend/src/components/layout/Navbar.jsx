// components/layout/Navbar.jsx
import { Bell, Moon, Sun } from "lucide-react";
import PropTypes from "prop-types";
import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { Button } from "../ui/Button.jsx";

export function Navbar({ title, breadcrumbs = [], pendingCount = 0 }) {
  const { user, logout } = useAuth();
  const { theme, toggleDarkMode } = useTheme();

  const crumbs = useMemo(() => breadcrumbs.filter(Boolean), [breadcrumbs]);

  return (
    <div className="sticky top-0 z-40 border-b border-vpms-border bg-vpms-surface/70 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          {crumbs.length ? (
            <div className="mb-1 text-xs text-vpms-muted">
              {crumbs.map((c, idx) => (
                <span key={c}>
                  {idx > 0 ? <span className="mx-2">/</span> : null}
                  <span>{c}</span>
                </span>
              ))}
            </div>
          ) : null}
          <div className="truncate text-sm font-semibold text-vpms-text">{title}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" className="!px-2" onClick={() => toggleDarkMode()} aria-label="Toggle dark mode">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          <div className="relative">
            <Bell size={18} className="text-vpms-muted" />
            {pendingCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-vpms-danger px-1 text-[10px] font-bold text-white">{pendingCount}</span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-semibold text-vpms-text">{user?.name}</div>
              <div className="text-[11px] text-vpms-muted">{user?.email}</div>
            </div>
            <Button type="button" variant="secondary" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

Navbar.propTypes = {
  title: PropTypes.string.isRequired,
  breadcrumbs: PropTypes.arrayOf(PropTypes.string),
  pendingCount: PropTypes.number,
};
