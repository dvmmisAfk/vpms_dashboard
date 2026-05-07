// pages/shared/AppointmentsListPage.jsx
import { useState } from "react";

import { AppShell } from "../../components/layout/AppShell.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { useApproveAppointment, useAppointments } from "../../hooks/useAppointments.js";
import { useAuth } from "../../hooks/useAuth.js";
import { APPOINTMENT_STATUSES, ROLES } from "../../utils/constants.js";
import { formatDateTime } from "../../utils/formatDate.js";

export default function AppointmentsListPage() {
  const { hasAnyRole, user } = useAuth();
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");

  const params = {}
  if (date) params.date = date
  if (status) params.status = status
  const apptQ = useAppointments(params);
  const approveM = useApproveAppointment();

  const rows = apptQ.data || [];

  const columns = [
    { key: "visitor", label: "Visitor", render: (row) => row.visitor?.name || "—" },
    { key: "host", label: "Host", render: (row) => row.host?.name || "—" },
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
    {
      key: "actions",
      label: "Actions",
      render: (row) =>
        hasAnyRole([ROLES.ADMIN, ROLES.EMPLOYEE]) && row.status === APPOINTMENT_STATUSES.PENDING ? (
          <Button
            type="button"
            variant="secondary"
            loading={approveM.isPending}
            onClick={() => approveM.mutate(row._id)}
          >
            Approve
          </Button>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ];

  return (
    <AppShell title="Appointments" breadcrumbs={["Operations", "Appointments"]}>
      <PageHeader title="Appointments" subtitle={`Signed in as ${user?.email || ""}`} />

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
