// pages/visitor/MyPassPage.jsx
import toast from "react-hot-toast";

import { AppShell } from "../../components/layout/AppShell.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { QRCode } from "../../components/common/QRCode.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { useMyPass } from "../../hooks/usePasses.js";
import { formatDateTime } from "../../utils/formatDate.js";

export default function MyPassPage() {
  const passQ = useMyPass();

  const pass = passQ.data;

  return (
    <AppShell title="My pass" breadcrumbs={["Visitor", "Pass"]}>
      <PageHeader title="Your visitor pass" subtitle="Show this QR code at the security desk for scanning." />

      {passQ.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : null}

      {!passQ.isLoading && !pass ? (
        <Card title="No active pass" subtitle="Passes are issued after your host approves and security prints a badge." />
      ) : null}

      {pass ? (
        <Card
          title={pass.visitor?.name || "Visitor"}
          actions={
            pass.pdfUrl ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  window.open(pass.pdfUrl, "_blank", "noopener,noreferrer");
                  toast.success("Opening PDF");
                }}
              >
                Download PDF
              </Button>
            ) : null
          }
        >
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex justify-center">
              <QRCode value={pass.passCode} size={280} />
            </div>
            <div className="w-full space-y-2 text-sm md:max-w-md">
              <div>
                <span className="text-vpms-muted">Pass code:</span> <span className="font-semibold">{pass.passCode}</span>
              </div>
              <div>
                <span className="text-vpms-muted">Valid:</span>{" "}
                <span className="font-semibold">
                  {formatDateTime(pass.validFrom)} → {formatDateTime(pass.validUntil)}
                </span>
              </div>
              <div>
                <span className="text-vpms-muted">Host:</span> <span className="font-semibold">{pass.visitor?.host?.name || pass.appointment?.host?.name || "—"}</span>
              </div>
            </div>
          </div>
        </Card>
      ) : null}
    </AppShell>
  );
}
