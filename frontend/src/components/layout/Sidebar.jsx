// sidebar navigation
import { LayoutDashboard, Users, Calendar, Shield, ScanLine, BadgeCheck, Mail, FileText, LineChart, ClipboardList } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        // highlight current page
        `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
          isActive
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  const { user, hasAnyRole, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  // only show links the user has access to
  const navItems = []

  if (hasAnyRole(['admin', 'security', 'employee'])) {
    navItems.push({ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' })
  }
  if (hasAnyRole(['admin', 'security'])) {
    navItems.push({ to: '/visitors', icon: Users, label: 'Visitors' })
  }

  navItems.push({ to: '/appointments', icon: Calendar, label: 'Appointments' })

  if (hasAnyRole(['admin', 'security'])) {
    navItems.push({ to: '/passes', icon: BadgeCheck, label: 'Passes' })
  }
  if (hasAnyRole(['security'])) {
    navItems.push({ to: '/check-in', icon: ScanLine, label: 'Check-In' })
    navItems.push({ to: '/issue-pass', icon: Shield, label: 'Issue Pass' })
  }
  if (hasAnyRole(['employee'])) {
    navItems.push({ to: '/invite', icon: Mail, label: 'Invite Visitor' })
    navItems.push({ to: '/my-appointments', icon: Calendar, label: 'My Appointments' })
  }
  if (hasAnyRole(['admin'])) {
    navItems.push({ to: '/reports', icon: FileText, label: 'Reports' })
    navItems.push({ to: '/analytics', icon: LineChart, label: 'Analytics' })
    navItems.push({ to: '/users', icon: Users, label: 'Users' })
    navItems.push({ to: '/audit-logs', icon: ClipboardList, label: 'Audit Logs' })
  }
  if (hasAnyRole(['visitor'])) {
    navItems.push({ to: '/my-pass', icon: BadgeCheck, label: 'My Pass' })
  }

  return (
    <>
      {/* mobile header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-3 md:hidden">
        <div className="text-sm font-bold text-slate-800">VPMS</div>
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600"
          onClick={() => setOpen(v => !v)}
        >
          Menu
        </button>
      </div>

      <aside className={`${open ? 'fixed inset-0 z-50 flex' : 'hidden'} md:flex`}>
        {open && (
          <button
            type="button"
            className="absolute inset-0 bg-black/50 md:hidden"
            onClick={close}
          />
        )}

        <div className="relative flex h-full w-64 flex-col border-r border-slate-200 bg-white md:static">
          <div className="border-b border-slate-200 px-4 py-4">
            <div className="text-lg font-black text-slate-800">VPMS</div>
            <div className="text-xs text-slate-500">Visitor Pass Management</div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
            {navItems.map(item => (
              <NavItem key={item.to} {...item} onClick={close} />
            ))}
          </nav>

          <div className="border-t border-slate-200 p-3">
            <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
              <div className="text-sm font-semibold text-slate-700">{user?.name}</div>
              <div className="text-xs text-slate-400 capitalize">{user?.role}</div>
            </div>
            {/* clear auth and go to login */}
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
