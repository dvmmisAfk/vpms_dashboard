export function StatsCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-500">{title}</div>
          <div className="mt-2 text-3xl font-bold text-slate-800">{value}</div>
        </div>
        {Icon && (
          <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
            <Icon size={20} className="text-indigo-500" />
          </div>
        )}
      </div>
    </div>
  )
}
