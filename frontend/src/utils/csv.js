// utils/csv.js
export function rowsToCsv(rows, fields) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = fields.map((f) => esc(f.label)).join(",");
  const body = rows.map((r) => fields.map((f) => esc(f.value(r))).join(",")).join("\n");
  return new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
}
