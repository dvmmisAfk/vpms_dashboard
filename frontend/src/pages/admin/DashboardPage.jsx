// pages/admin/DashboardPage.jsx
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { listAppointments } from "../../api/appointments.js";
import { listCheckLogs } from "../../api/checks.js";
import { exportVisitorsCsv, fetchDashboardStats, fetchRecentCheckIns } from "../../api/dashboard.js";
import { listVisitors } from "../../api/visitors.js";
import { ExportButton } from "../../components/common/ExportButton.jsx";
import { StatsCard } from "../../components/common/StatsCard.jsx";
import { AppShell } from "../../components/layout/AppShell.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { ROLES } from "../../utils/constants.js";
import { formatRelative } from "../../utils/formatDate.js";

const socketUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

export default function DashboardPage() {
  const { hasAnyRole } = useAuth();

  const statsQ = useQuery({ queryKey: ["dashboard-stats"], queryFn: fetchDashboardStats, staleTime: 15_000 });
  const recentQ = useQuery({ queryKey: ["dashboard-recent"], queryFn: fetchRecentCheckIns, staleTime: 10_000 });

  const since = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString();
  }, []);

  const weekLogsQ = useQuery({
    queryKey: ["check-logs-week", since],
    queryFn: () => listCheckLogs({ start: since }),
    staleTime: 30_000,
  });

  const visitorsPurposeQ = useQuery({
    queryKey: ["visitors-purpose-sample"],
    queryFn: () => listVisitors({ page: 1, limit: 200 }),
    staleTime: 60_000,
    enabled: hasAnyRole([ROLES.ADMIN, ROLES.SECURITY]),
  });

  const pendingQ = useQuery({
    queryKey: ["appointments-pending"],
    queryFn: () => listAppointments({ status: "pending" }),
    staleTime: 15_000,
    enabled: hasAnyRole([ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.SECURITY]),
  });

  useEffect(() => {
    const socket = io(socketUrl, { transports: ["websocket"] });

    socket.on("check-event", (payload) => {
      toast(`${payload?.event || "event"} • ${payload?.visitor || payload?.passCode || "unknown"}`, { duration: 2500 });
    });

    return () => socket.disconnect();
  }, []);

  const lineData = useMemo(() => {
    const logs = weekLogsQ.data || [];
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return { day: key, checkIns: 0 };
    });

    const map = new Map(buckets.map((b) => [b.day, b]));
    for (const log of logs) {
      if (log.action !== "check-in") continue;
      const day = new Date(log.timestamp).toISOString().slice(0, 10);
      const row = map.get(day);
      if (!row) continue;
      row.checkIns += 1;
    }
    return buckets;
  }, [weekLogsQ.data]);

  const purposePie = useMemo(() => {
    const visitors = visitorsPurposeQ.data?.data || [];
    const tally = new Map();
    for (const v of visitors) {
      const purpose = v.purpose || "unknown";
      tally.set(purpose, (tally.get(purpose) || 0) + 1);
    }
    return [...tally.entries()].map(([name, value]) => ({ name, value }));
  }, [visitorsPurposeQ.data]);

  const columns = [
    { key: "visitor", label: "Visitor", render: (row) => row.visitor?.name || "-" },
    { key: "time", label: "When", render: (row) => formatRelative(row.timestamp) },
    { key: "scanner", label: "Scanned by", render: (row) => row.scannedBy?.name || "-" },
  ];

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#64748b"];

  return (
    <AppShell title="Dashboard" breadcrumbs={["Home", "Dashboard"]} pendingCount={(pendingQ.data || []).length}>
      <PageHeader
        title="Overview"
        subtitle="Visitor counts, approvals, and recent check activity."
        actions={
          <>
            {hasAnyRole([ROLES.ADMIN, ROLES.SECURITY]) ? (
              <Button type="button" variant="secondary" onClick={() => (window.location.href = "/issue-pass")}>
                Issue Pass
              </Button>
            ) : null}
            {hasAnyRole([ROLES.ADMIN]) ? (
              <Button type="button" variant="secondary" onClick={() => (window.location.href = "/reports")}>
                Reports
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <StatsCard title="Visitors today (unique)" value={statsQ.data?.totalVisitorsToday ?? "—"} trend="flat" />
        <StatsCard title="Pending approvals" value={statsQ.data?.pendingApprovals ?? "—"} trend="flat" />
        <StatsCard title="Active passes" value={statsQ.data?.activePasses ?? "—"} trend="flat" />
        <StatsCard title="Check-ins today" value={statsQ.data?.checkedInNow ?? "—"} deltaLabel={`${statsQ.data?.checkInRate ?? 0}% rate`} trend="flat" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Check-ins over last 7 days">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="checkIns" stroke="rgb(var(--vpms-brand))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Visitors by purpose (sample)">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={purposePie} dataKey="value" nameKey="name" outerRadius={90}>
                  {purposePie.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-4" title="Recent check-ins">
        <Table columns={columns} rows={recentQ.data || []} empty={recentQ.isLoading ? "Loading..." : "No recent check-ins"} />
      </Card>

      {hasAnyRole([ROLES.ADMIN, ROLES.SECURITY]) ? (
        <div className="mt-4 flex justify-end">
          <ExportButton label="Export visitors CSV" filename="visitors.csv" onExport={exportVisitorsCsv} />
        </div>
      ) : null}
    </AppShell>
  );
}
