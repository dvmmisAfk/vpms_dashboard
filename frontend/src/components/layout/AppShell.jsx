import { Navbar } from './Navbar.jsx'
import { Sidebar } from './Sidebar.jsx'

export function AppShell({ title, breadcrumbs = [], pendingCount = 0, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Navbar title={title} breadcrumbs={breadcrumbs} pendingCount={pendingCount} />
          <main className="flex-1 px-4 py-5">{children}</main>
        </div>
      </div>
    </div>
  )
}
