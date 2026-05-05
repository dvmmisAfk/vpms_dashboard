// pages/shared/VisitorsListPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { exportVisitorsCsv } from "../../api/dashboard.js";
import { ExportButton } from "../../components/common/ExportButton.jsx";
import { AppShell } from "../../components/layout/AppShell.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Pagination } from "../../components/ui/Pagination.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { useVisitorsList } from "../../hooks/useVisitors.js";
import { VISITOR_STATUSES } from "../../utils/constants.js";
import { formatDateTime } from "../../utils/formatDate.js";

export default function VisitorsListPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  const query = useMemo(() => ({ q: debouncedQ, status: status || undefined, page, limit: 10 }), [debouncedQ, status, page]);

  const visitorsQ = useVisitorsList(query);
  const rows = visitorsQ.data?.data || [];
  const meta = visitorsQ.data?.meta || { total: 0, page: 1, limit: 10 };
  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 10)));

  const columns = [
    {
      key: "photo",
      label: "Photo",
      render: (row) => (
        <div className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-vpms-border">
          {row.photoUrl ? <img src={row.photoUrl} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-vpms-bg" />}
        </div>
      ),
    },
    { key: "name", label: "Name", render: (row) => row.name },
    { key: "company", label: "Company", render: (row) => row.company || "—" },
    { key: "host", label: "Host", render: (row) => row.host?.name || "—" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge variant="status" value={row.status}>
          {row.status}
        </Badge>
      ),
    },
    { key: "created", label: "Created", render: (row) => formatDateTime(row.createdAt) },
  ];

  return (
    <AppShell title="Visitors" breadcrumbs={["Directory", "Visitors"]}>
      <PageHeader title="Visitors" subtitle="Search, filter by status, and drill into profiles." />

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input label="Search" placeholder="Name, email, company…" value={q} onChange={(e) => setQ(e.target.value)} />

        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any</option>
          {Object.values(VISITOR_STATUSES).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <div className="md:col-span-2 flex items-end justify-end gap-2">
          <ExportButton label="Export CSV" filename="visitors.csv" onExport={exportVisitorsCsv} />
        </div>
      </div>

      <Table
        columns={columns}
        rows={rows}
        onRowClick={(row) => navigate(`/visitors/${row._id}`)}
        empty={visitorsQ.isLoading ? "Loading…" : "No visitors found"}
      />

      <Pagination page={meta.page || page} totalPages={totalPages} onChange={setPage} />
    </AppShell>
  );
}
