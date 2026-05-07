export function Table({ columns, rows, empty, onRowClick }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
        {empty || 'Nothing here yet'}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, i) => (
            <tr
              key={row._id || row.id || i}
              onClick={() => onRowClick && onRowClick(row)}
              className={`hover:bg-slate-50 ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map(col => (
                <td key={col.key} className="px-3 py-3">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
