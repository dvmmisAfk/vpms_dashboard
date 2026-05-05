// pages/shared/VisitorDetailPage.jsx
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { listCheckLogs } from "../../api/checks.js";
import { listPasses } from "../../api/passes.js";
import { QRCode } from "../../components/common/QRCode.jsx";
import { AppShell } from "../../components/layout/AppShell.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { useApproveVisitor, useRejectVisitor, useVisitorDetail } from "../../hooks/useVisitors.js";
import { useAuth } from "../../hooks/useAuth.js";
import { ROLES } from "../../utils/constants.js";
import { formatDateTime } from "../../utils/formatDate.js";

export default function VisitorDetailPage() {
  const { id } = useParams();
  const { hasAnyRole } = useAuth();

  const visitorQ = useVisitorDetail(id);
  const visitor = visitorQ.data;

  const approveM = useApproveVisitor(id);
  const rejectM = useRejectVisitor(id);

  const passesQ = useQuery({
    queryKey: ["passes-for-visitor", id],
    queryFn: listPasses,
    enabled: Boolean(id),
    staleTime: 15_000,
    select: (data) => (data || []).filter((p) => p.visitor?._id === id || p.visitor === id),
  });

  const pass = passesQ.data?.[0];

  const logsQ = useQuery({
    queryKey: ["visitor-check-logs", id],
    queryFn: async () => {
      const all = await listCheckLogs({});
      return (all || []).filter((l) => String(l.visitor?._id || l.visitor) === String(id));
    },
    enabled: Boolean(id),
    staleTime: 15_000,
  });

  const timeline = useMemo(() => [...(logsQ.data || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)), [logsQ.data]);

  const actions =
    visitor && (
      <div className="flex flex-wrap gap-2">
        {hasAnyRole([ROLES.ADMIN, ROLES.EMPLOYEE]) ? (
          <>
            <Button type="button" variant="secondary" loading={approveM.isPending} onClick={() => approveM.mutate()}>
              Approve
            </Button>
            <Button type="button" variant="danger" loading={rejectM.isPending} onClick={() => rejectM.mutate()}>
              Reject
            </Button>
          </>
        ) : null}
        {hasAnyRole([ROLES.ADMIN, ROLES.SECURITY]) ? (
          <Button type="button" onClick={() => (window.location.href = `/issue-pass?visitor=${id}`)}>
            Issue pass
          </Button>
        ) : null}
        {hasAnyRole([ROLES.ADMIN, ROLES.SECURITY]) ? (
          <Button type="button" variant="secondary" onClick={() => (window.location.href = "/check-in")}>
            Scan check-in/out
          </Button>
        ) : null}
      </div>
    );

  if (visitorQ.isLoading) {
    return (
      <AppShell title="Visitor" breadcrumbs={["Visitors", "Detail"]}>
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </AppShell>
    );
  }

  if (!visitor) {
    return (
      <AppShell title="Visitor" breadcrumbs={["Visitors", "Detail"]}>
        <div className="text-sm text-vpms-muted">Visitor not found</div>
      </AppShell>
    );
  }

  return (
    <AppShell title={visitor.name} breadcrumbs={["Visitors", visitor.name]}>
      <PageHeader title={visitor.name} subtitle={visitor.company || ""} actions={actions} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Visitor profile">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="mx-auto h-44 w-44 overflow-hidden rounded-2xl ring-1 ring-vpms-border sm:mx-0">
              {visitor.photoUrl ? <img src={visitor.photoUrl} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-vpms-bg" />}
            </div>
            <div className="flex-1 space-y-2 text-sm">
              <div>
                <Badge variant="status" value={visitor.status}>
                  {visitor.status}
                </Badge>
              </div>
              <div>
                <span className="text-vpms-muted">Email:</span> <span className="font-semibold">{visitor.email || "—"}</span>
              </div>
              <div>
                <span className="text-vpms-muted">Phone:</span> <span className="font-semibold">{visitor.phone || "—"}</span>
              </div>
              <div>
                <span className="text-vpms-muted">Purpose:</span> <span className="font-semibold">{visitor.purpose || "—"}</span>
              </div>
              <div>
                <span className="text-vpms-muted">Host:</span> <span className="font-semibold">{visitor.host?.name || "—"}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Active pass">
          {!pass ? <div className="text-sm text-vpms-muted">No issued pass yet</div> : null}

          {pass ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-1 flex items-center justify-center">
                <QRCode value={pass.passCode} size={240} />
              </div>
              <div className="md:col-span-2 space-y-2 text-sm">
                <div>
                  <span className="text-vpms-muted">Pass code:</span> <span className="font-semibold">{pass.passCode}</span>
                </div>
                <div>
                  <span className="text-vpms-muted">Validity:</span>{" "}
                  <span className="font-semibold">
                    {formatDateTime(pass.validFrom)} → {formatDateTime(pass.validUntil)}
                  </span>
                </div>
                {pass.pdfUrl ? (
                  <a className="inline-flex text-sm font-semibold text-vpms-brand underline" href={pass.pdfUrl} target="_blank" rel="noreferrer">
                    Download PDF
                  </a>
                ) : (
                  <div className="text-sm text-vpms-muted">PDF unavailable (configure Cloudinary keys)</div>
                )}
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <Card className="mt-4" title="Check timeline">
        <div className="space-y-3">
          {timeline.map((l) => (
            <div key={l._id} className="rounded-lg bg-vpms-bg px-3 py-2 text-sm ring-1 ring-vpms-border">
              <div className="font-semibold">
                {l.action} • {formatDateTime(l.timestamp)}
              </div>
              <div className="text-xs text-vpms-muted">by {l.scannedBy?.name || "—"}</div>
              {l.notes ? <div className="mt-1 text-xs text-vpms-muted">{l.notes}</div> : null}
            </div>
          ))}
          {!timeline.length ? <div className="text-sm text-vpms-muted">No scans yet</div> : null}
        </div>
      </Card>
    </AppShell>
  );
}
