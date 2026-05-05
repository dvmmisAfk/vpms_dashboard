// pages/admin/ReportsPage.jsx
import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { listCheckLogs } from "../../api/checks.js";
import { ExportButton } from "../../components/common/ExportButton.jsx";
import { AppShell } from "../../components/layout/AppShell.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { useQuery } from "@tanstack/react-query";
import { CHECK_ACTIONS } from "../../utils/constants.js";
import { rowsToCsv } from "../../utils/csv.js";
import { formatDateTime } from "../../utils/formatDate.js";

export default function ReportsPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [action, setAction] = useState("");
  const [hostFilter, setHostFilter] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (start) p.start = new Date(start).toISOString();
    if (end) p.end = new Date(end).toISOString();
    if (action) p.action = action;
    return p;
  }, [start, end, action]);

  const logsQ = useQuery({
    queryKey: ["reports-logs", params],
    queryFn: () => listCheckLogs(params),
    staleTime: 15_000,
  });

  const rows = useMemo(() => {
    const items = logsQ.data || [];
    return items.filter((l) => {
      if (hostFilter && !(l.visitor?.host?.name || "").toLowerCase().includes(hostFilter.toLowerCase())) return false;
      if (purposeFilter && !(l.visitor?.purpose || "").toLowerCase().includes(purposeFilter.toLowerCase())) return false;
      return true;
    });
  }, [logsQ.data, hostFilter, purposeFilter]);

  const hourBuckets = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
    for (const l of rows) {
      if (l.action !== CHECK_ACTIONS.CHECK_IN) continue;
      const hour = new Date(l.timestamp).getHours();
      buckets[hour].count += 1;
    }
    return buckets;
  }, [rows]);

  const columns = [
    { key: "when", label: "When", render: (row) => formatDateTime(row.timestamp) },
    { key: "action", label: "Action", render: (row) => row.action },
    { key: "visitor", label: "Visitor", render: (row) => row.visitor?.name || "—" },
    { key: "host", label: "Host", render: (row) => row.visitor?.host?.name || "—" },
    { key: "purpose", label: "Purpose", render: (row) => row.visitor?.purpose || "—" },
    { key: "scanner", label: "Scanned by", render: (row) => row.scannedBy?.name || "—" },
  ];

  return (
    <AppShell title="Reports" breadcrumbs={["Admin", "Reports"]}>
      <PageHeader title="Visitor logs" subtitle="Filter check events and export CSV." />

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-6">
        <Input label="Start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        <Input label="End" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />

        <Select label="Action" value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">Any</option>
          <option value={CHECK_ACTIONS.CHECK_IN}>{CHECK_ACTIONS.CHECK_IN}</option>
          <option value={CHECK_ACTIONS.CHECK_OUT}>{CHECK_ACTIONS.CHECK_OUT}</option>
        </Select>

        <Input label="Host contains" value={hostFilter} onChange={(e) => setHostFilter(e.target.value)} />
        <Input label="Purpose contains" value={purposeFilter} onChange={(e) => setPurposeFilter(e.target.value)} />

        <div className="flex items-end justify-end">
          <ExportButton
            label="Export CSV"
            filename="check-logs.csv"
            onExport={async () =>
              rowsToCsv(rows, [
                { label: "timestamp", value: (r) => r.timestamp },
                { label: "action", value: (r) => r.action },
                { label: "visitor", value: (r) => r.visitor?.name },
                { label: "host", value: (r) => r.visitor?.host?.name },
                { label: "purpose", value: (r) => r.visitor?.purpose },
                { label: "scanner", value: (r) => r.scannedBy?.email },
              ])
            }
          />
        </div>
      </div>

      <div className="mb-4 rounded-xl bg-vpms-surface p-4 shadow-sm ring-1 ring-vpms-border">
        <div className="mb-2 text-sm font-semibold text-vpms-text">Busiest check-in hours (filtered)</div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourBuckets}>
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="rgb(var(--vpms-brand))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Table columns={columns} rows={rows} empty={logsQ.isLoading ? "Loading…" : "No rows"} />
    </AppShell>
  );
}
