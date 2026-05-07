// pages/shared/PassesListPage.jsx
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

import { listPasses } from "../../api/passes.js";
import { AppShell } from "../../components/layout/AppShell.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { useDeactivatePass } from "../../hooks/usePasses.js";
import { formatDateTime } from "../../utils/formatDate.js";

export default function PassesListPage() {
  const passesQ = useQuery({
    queryKey: ["passes-list"],
    queryFn: listPasses,
    staleTime: 15_000,
  });

  const deactivateM = useDeactivatePass();

  const rows = passesQ.data || [];

  const columns = [
    { key: "visitor", label: "Visitor", render: (row) => row.visitor?.name || "—" },
    { key: "code", label: "Pass code", render: (row) => row.passCode },
    { key: "valid", label: "Validity", render: (row) => `${formatDateTime(row.validFrom)} → ${formatDateTime(row.validUntil)}` },
    {
      key: "active",
      label: "Active",
      render: (row) => (row.isActive ? "yes" : "no"),
    },
    {
      key: "actions",
      label: "",
      render: (row) =>
        row.isActive ? (
          <Button
            type="button"
            variant="danger"
            loading={deactivateM.isPending}
            onClick={async () => {
              try {
                await deactivateM.mutateAsync(row._id);
                toast.success("Pass deactivated");
              } catch (e) {
                toast.error('Failed to deactivate');
              }
            }}
          >
            Deactivate
          </Button>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ];

  return (
    <AppShell title="Passes" breadcrumbs={["Security", "Passes"]}>
      <PageHeader title="Issued passes" subtitle="Deactivate compromised QR codes instantly." />

      <Table columns={columns} rows={rows} empty={passesQ.isLoading ? "Loading…" : "No passes"} />
    </AppShell>
  );
}
