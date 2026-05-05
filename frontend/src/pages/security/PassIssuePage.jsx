// pages/security/PassIssuePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { AppShell } from "../../components/layout/AppShell.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { QRCode } from "../../components/common/QRCode.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { useIssuePass } from "../../hooks/usePasses.js";
import { apiErrorMessage } from "../../utils/apiError.js";
import { useVisitorsList } from "../../hooks/useVisitors.js";

export default function PassIssuePage() {
  const [params] = useSearchParams();
  const preselect = params.get("visitor");

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const visitorsQ = useVisitorsList({ q: debouncedQ, page: 1, limit: 8 });
  const issueM = useIssuePass();

  useEffect(() => {
    if (!preselect) return;
    setSelected({ _id: preselect });
  }, [preselect]);

  const rows = visitorsQ.data?.data || [];

  const columns = useMemo(
    () => [
      { key: "name", label: "Name", render: (row) => row.name },
      { key: "email", label: "Email", render: (row) => row.email || "—" },
      { key: "company", label: "Company", render: (row) => row.company || "—" },
      {
        key: "pick",
        label: "",
        render: (row) => (
          <Button type="button" variant="secondary" onClick={() => setSelected(row)}>
            Select
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <AppShell title="Issue pass" breadcrumbs={["Security", "Issue Pass"]}>
      <PageHeader title="Issue visitor pass" subtitle="Pick a visitor and define the active window for the badge." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Find visitor">
          <Input label="Search" placeholder="Name, email, company…" value={q} onChange={(e) => setQ(e.target.value)} />

          <div className="mt-3">
            <Table columns={columns} rows={rows} empty={visitorsQ.isLoading ? "Searching…" : "No matches"} />
          </div>
        </Card>

        <Card
          title={selected ? `Selected: ${selected.name || selected._id}` : "Select a visitor"}
          subtitle="Generate QR + PDF (PDF requires Cloudinary)."
        >
          <div className="grid grid-cols-1 gap-3">
            <Input label="Valid from" type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
            <Input label="Valid until" type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />

            <Button
              type="button"
              disabled={!selected?._id || !validFrom || !validUntil}
              loading={issueM.isPending}
              onClick={async () => {
                try {
                  const payload = { validFrom: new Date(validFrom).toISOString(), validUntil: new Date(validUntil).toISOString() };
                  const pass = await issueM.mutateAsync({ visitorId: selected._id, payload });
                  toast.success("Pass issued");
                  setSelected((prev) => ({ ...prev, pass }));
                } catch (e) {
                  toast.error(apiErrorMessage(e, "Failed to issue pass"));
                }
              }}
            >
              Issue pass
            </Button>

            {selected?.pass?.passCode ? (
              <div className="rounded-xl bg-vpms-bg p-4 ring-1 ring-vpms-border">
                <div className="text-sm font-semibold">QR preview</div>
                <div className="mt-3 flex justify-center">
                  <QRCode value={selected.pass.passCode} size={220} />
                </div>
                {selected.pass.pdfUrl ? (
                  <a className="mt-3 block text-center text-sm font-semibold text-vpms-brand underline" href={selected.pass.pdfUrl} target="_blank" rel="noreferrer">
                    Download PDF
                  </a>
                ) : (
                  <div className="mt-3 text-center text-xs text-vpms-muted">PDF not generated (check Cloudinary credentials)</div>
                )}
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
