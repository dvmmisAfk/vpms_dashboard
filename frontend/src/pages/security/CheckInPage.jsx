// pages/security/CheckInPage.jsx
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { checkIn as checkInApi, checkOut as checkOutApi } from "../../api/checks.js";
import { verifyPassCode } from "../../api/passes.js";
import { QRScanner } from "../../components/common/QRScanner.jsx";
import { AppShell } from "../../components/layout/AppShell.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { apiErrorMessage } from "../../utils/apiError.js";
import { VISITOR_STATUSES } from "../../utils/constants.js";
import { formatDateTime } from "../../utils/formatDate.js";

export default function CheckInPage() {
  const [mode, setMode] = useState("in");
  const [manualCode, setManualCode] = useState("");
  const [verify, setVerify] = useState(null);
  const [loading, setLoading] = useState(false);

  const decision = useMemo(() => {
    if (!verify) return { tone: "amber", msg: "Scan a QR code or enter manually" };

    const now = Date.now();
    const start = new Date(verify.validFrom).getTime();
    const end = new Date(verify.validUntil).getTime();
    const expired = now < start || now > end;

    if (!verify.isActive || expired) return { tone: "red", msg: "Invalid or expired pass" };
    if (verify.visitor?.status === VISITOR_STATUSES.CHECKED_IN && mode === "in") return { tone: "amber", msg: "Already checked in" };

    return { tone: "green", msg: "Valid pass — proceed" };
  }, [verify, mode]);

  const ring =
    decision.tone === "green" ? "ring-emerald-600/35" : decision.tone === "red" ? "ring-red-600/35" : "ring-amber-600/35";

  async function runVerify(code) {
    const trimmed = String(code || "").trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const data = await verifyPassCode(trimmed);
      setVerify(data);
      toast.success("Pass verified");
    } catch (e) {
      toast.error(apiErrorMessage(e, "Verify failed"));
      setVerify(null);
    } finally {
      setLoading(false);
    }
  }

  async function runAction(code) {
    const trimmed = String(code || "").trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      if (mode === "in") await checkInApi({ passCode: trimmed });
      else await checkOutApi({ passCode: trimmed });
      toast.success(mode === "in" ? "Checked in" : "Checked out");
      setVerify(null);
    } catch (e) {
      toast.error(apiErrorMessage(e, "Action failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Check-in" breadcrumbs={["Security", "Check-in"]}>
      <PageHeader
        title="Scan visitor passes"
        subtitle="Use the camera scanner or manual entry as a fallback."
        actions={
          <div className="flex gap-2">
            <Button type="button" variant={mode === "in" ? "primary" : "secondary"} onClick={() => setMode("in")}>
              Check-in
            </Button>
            <Button type="button" variant={mode === "out" ? "primary" : "secondary"} onClick={() => setMode("out")}>
              Check-out
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Scanner">
          <div className="overflow-hidden rounded-xl">
            <QRScanner
              onDecoded={(text) => {
                runVerify(text);
              }}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
            <Input label="Manual pass code" value={manualCode} onChange={(e) => setManualCode(e.target.value)} />
            <div className="sm:pt-6">
              <Button type="button" className="w-full" variant="secondary" loading={loading} onClick={() => runVerify(manualCode)}>
                Verify
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Result" subtitle={decision.msg}>
          <div className={`rounded-xl bg-vpms-bg p-4 ring-2 ${ring}`}>
            {!verify ? <div className="text-sm text-vpms-muted">Waiting for scan…</div> : null}

            {verify ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-lg font-bold text-vpms-text">{verify.visitor?.name}</div>
                  <Badge variant="status" value={verify.visitor?.status}>
                    {verify.visitor?.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-vpms-muted">Company:</span> <span className="font-semibold">{verify.visitor?.company || "—"}</span>
                </div>
                <div>
                  <span className="text-vpms-muted">Purpose:</span> <span className="font-semibold">{verify.visitor?.purpose || "—"}</span>
                </div>
                <div>
                  <span className="text-vpms-muted">Host:</span> <span className="font-semibold">{verify.visitor?.host?.name || "—"}</span>
                </div>
                <div>
                  <span className="text-vpms-muted">Validity:</span>{" "}
                  <span className="font-semibold">
                    {formatDateTime(verify.validFrom)} → {formatDateTime(verify.validUntil)}
                  </span>
                </div>

                <div className="pt-2">
                  <Button type="button" className="w-full" loading={loading} onClick={() => runAction(verify.passCode)}>
                    {mode === "in" ? "Confirm check-in" : "Confirm check-out"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
