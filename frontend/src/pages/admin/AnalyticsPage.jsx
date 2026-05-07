// pages/admin/AnalyticsPage.jsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { fetchAnalyticsSummary, fetchAverageDuration, fetchPeakHours } from "../../api/analytics.js";
import { AppShell } from "../../components/layout/AppShell.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { Table } from "../../components/ui/Table.jsx";

export default function AnalyticsPage() {
  const summaryQ = useQuery({ queryKey: ["analytics-summary"], queryFn: fetchAnalyticsSummary, staleTime: 30000 });
  const peaksQ = useQuery({ queryKey: ["analytics-peaks"], queryFn: fetchPeakHours, staleTime: 60000 });

  // couldnt get this to work with useQuery for some reason so just using useEffect
  const [durData, setDurData] = useState(null)
  useEffect(() => {
    fetchAverageDuration()
      .then(function(data) { setDurData(data) })
      .catch(function(err) { console.warn('duration fetch failed:', err) })
  }, [])

  const trending = [
    { label: "Daily (unique)", value: summaryQ.data?.uniqueVisitorsDaily },
    { label: "Weekly (unique)", value: summaryQ.data?.uniqueVisitorsWeekly },
    { label: "Monthly (unique)", value: summaryQ.data?.uniqueVisitorsMonthly },
  ];

  const hostRows = summaryQ.data?.topHostsByVisitorCount || [];
  const hostColumns = [
    { key: "hostName", label: "Host", render: (row) => row.hostName },
    { key: "email", label: "Email", render: (row) => row.email || "—" },
    { key: "count", label: "Visitors", render: (row) => row.count },
  ];

  return (
    <AppShell title="Analytics" breadcrumbs={["Admin", "Analytics"]}>
      <PageHeader
        title="Analytics"
        subtitle={`Average visit duration: ${durData?.averageVisitMinutes ?? "—"} minutes (n=${durData?.sampleSize ?? 0})`}
      />

      {(summaryQ.isLoading || peaksQ.isLoading) && (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Visitor trend framing" subtitle="Distinct visitors with at least one check-in during the window.">
          <div className="space-y-2 text-sm">
            {trending.map((t) => (
              <div key={t.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 border border-slate-200">
                <span className="text-slate-500">{t.label}</span>
                <span className="font-bold text-slate-800">{t.value ?? "—"}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Peak hours heatmap">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peaksQ.data || []}>
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#10b981" fill="rgba(16, 185, 129, 0.25)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Purpose breakdown">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryQ.data?.purposeBreakdown || []}>
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Top hosts">
          <Table columns={hostColumns} rows={hostRows} empty="No host data yet" />
        </Card>
      </div>
    </AppShell>
  );
}
