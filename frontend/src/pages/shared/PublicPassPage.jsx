// pages/shared/PublicPassPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { verifyPassCode } from "../../api/passes.js";
import { QRCode } from "../../components/common/QRCode.jsx";
import { AuthPageShell } from "../../components/layout/AuthPageShell.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { formatDateTime } from "../../utils/formatDate.js";

export default function PublicPassPage() {
  const { passCode: routeCode } = useParams();
  const [code, setCode] = useState(routeCode || "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const status = data?.visitor?.status;

  useEffect(() => {
    if (routeCode) {
      setCode(routeCode);
    }
  }, [routeCode]);

  return (
    <AuthPageShell contentClassName="max-w-3xl flex flex-col gap-4">
        <Card title="Public pass verification" subtitle="Enter a pass code to validate visitor details.">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input label="Pass code" value={code} onChange={(e) => setCode(e.target.value)} />
            <div className="sm:pt-6">
              <Button
                type="button"
                className="w-full sm:w-auto"
                loading={loading}
                onClick={async () => {
                  setLoading(true);
                  setError("");
                  try {
                    const res = await verifyPassCode(code);
                    setData(res);
                  } catch (e) {
                    setError(e?.response?.data?.message || "Not found");
                    setData(null);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Verify
              </Button>
            </div>
          </div>
          {error ? <div className="mt-3 text-sm text-red-500">{error}</div> : null}
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner />
          </div>
        ) : null}

        {data ? (
          <Card
            title={data.visitor?.name || "Visitor"}
            subtitle={data.visitor?.company || ""}
            actions={
              status ? (
                <Badge variant="status" value={status}>
                  {status}
                </Badge>
              ) : null
            }
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                {data.visitor?.photoUrl ? (
                  <img src={data.visitor.photoUrl} alt="" className="w-full rounded-xl ring-1 ring-slate-200" />
                ) : (
                  <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No photo</div>
                )}
              </div>
              <div className="md:col-span-2 space-y-2 text-sm">
                <div>
                  <span className="text-slate-500">Pass code:</span> <span className="font-semibold">{data.passCode}</span>
                </div>
                <div>
                  <span className="text-slate-500">Valid:</span>{" "}
                  <span className="font-semibold">
                    {formatDateTime(data.validFrom)} → {formatDateTime(data.validUntil)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Host:</span> <span className="font-semibold">{data.visitor?.host?.name || ""}</span>
                </div>
                <div className="pt-2">
                  <QRCode value={data.passCode} size={180} />
                </div>
              </div>
            </div>
          </Card>
        ) : null}
    </AuthPageShell>
  );
}
