const statusColors = {
  pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  approved: 'bg-blue-100 text-blue-800 ring-blue-200',
  'checked-in': 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  'checked-out': 'bg-slate-100 text-slate-700 ring-slate-200',
  rejected: 'bg-red-100 text-red-800 ring-red-200',
  cancelled: 'bg-gray-100 text-gray-700 ring-gray-200',
}

const roleColors = {
  admin: 'bg-purple-100 text-purple-800 ring-purple-200',
  security: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
  employee: 'bg-sky-100 text-sky-800 ring-sky-200',
  visitor: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
}

export function Badge({ children, variant = 'neutral', value }) {
  let cls = 'bg-slate-100 text-slate-700 ring-slate-200'

  if (variant === 'status' && statusColors[value]) {
    cls = statusColors[value]
  } else if (variant === 'role' && roleColors[value]) {
    cls = roleColors[value]
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}>
      {children}
    </span>
  )
}
