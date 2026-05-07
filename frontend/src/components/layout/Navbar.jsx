import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export function Navbar({ title, breadcrumbs = [], pendingCount = 0 }) {
  const { user } = useAuth()

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          {breadcrumbs.length > 0 && (
            <div className="mb-1 text-xs text-slate-400">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb}>
                  {i > 0 && <span className="mx-1">/</span>}
                  {crumb}
                </span>
              ))}
            </div>
          )}
          <div className="text-sm font-semibold text-slate-800">{title}</div>
        </div>

        <div className="flex items-center gap-3">
          {/* notification bell - only show if there's pending stuff */}
          <div className="relative">
            <Bell size={18} className="text-slate-400" />
            {pendingCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-700">{user?.name}</div>
            <div className="text-[11px] text-slate-400 capitalize">{user?.role}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
