// pages/employee/MyAppointmentsPage.jsx
import { useMemo, useState } from "react";

import { AppShell } from "../../components/layout/AppShell.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { useAppointments } from "../../hooks/useAppointments.js";
import { APPOINTMENT_STATUSES } from "../../utils/constants.js";
import { formatDateTime } from "../../utils/formatDate.js";

export default function MyAppointmentsPage() {
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");

  const params = useMemo(() => ({ date: date || undefined, status: status || undefined }), [date, status]);
  const apptQ = useAppointments(params);
  const rows = apptQ.data || [];

  const columns = [
    { key: "visitor", label: "Visitor", render: (row) => row.visitor?.name || "—" },
    { key: "when", label: "Scheduled", render: (row) => formatDateTime(row.scheduledAt) },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge variant="status" value={row.status}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <AppShell title="My appointments" breadcrumbs={["Employee", "Appointments"]}>
      <PageHeader title="My appointments" subtitle="These results are filtered to your host account on the server." />

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input label="Filter by date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any</option>
          {Object.values(APPOINTMENT_STATUSES).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <Table columns={columns} rows={rows} empty={apptQ.isLoading ? "Loading…" : "No appointments"} />
    </AppShell>
  );
}
