// components/ui/Table.jsx
import PropTypes from "prop-types";

export function Table({ columns, rows, empty, onRowClick }) {
  if (!rows?.length) {
    return (
      <div className="rounded-xl border border-dashed border-vpms-border bg-vpms-bg p-10 text-center text-sm text-vpms-muted">
        {empty || "Nothing to display yet"}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-vpms-border">
      <table className="min-w-full divide-y divide-vpms-border text-sm">
        <thead className="bg-vpms-bg">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-vpms-muted">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-vpms-border bg-vpms-surface">
          {rows.map((row, idx) => (
            <tr key={row.id || idx} className="hover:bg-black/5 dark:hover:bg-white/5">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 py-3 ${col.truncate ? "max-w-[220px] truncate" : ""} ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      truncate: PropTypes.bool,
      render: PropTypes.func.isRequired,
    }),
  ).isRequired,
  rows: PropTypes.array.isRequired,
  empty: PropTypes.node,
  onRowClick: PropTypes.func,
};
