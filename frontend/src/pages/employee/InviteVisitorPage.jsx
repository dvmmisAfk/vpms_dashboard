// pages/employee/InviteVisitorPage.jsx
import toast from "react-hot-toast";

import { AppointmentForm } from "../../components/forms/AppointmentForm.jsx";
import { AppShell } from "../../components/layout/AppShell.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { useCreateAppointment } from "../../hooks/useAppointments.js";
import { useAuth } from "../../hooks/useAuth.js";
import { apiErrorMessage } from "../../utils/apiError.js";

export default function InviteVisitorPage() {
  const { user } = useAuth();
  const createM = useCreateAppointment();

  return (
    <AppShell title="Invite visitor" breadcrumbs={["Employee", "Invite"]}>
      <PageHeader title="Invite a visitor" subtitle="Creates a visitor record and emails a secure pre-registration link." />

      <Card>
        <AppointmentForm
          defaultHostId={user?.id}
          loading={createM.isPending}
          onSubmit={async (values) => {
            try {
              const scheduledAt = new Date(values.scheduledAt).toISOString();
              await createM.mutateAsync({
                visitorName: values.visitorName,
                visitorEmail: values.visitorEmail || undefined,
                visitorPhone: values.visitorPhone || undefined,
                company: values.company || undefined,
                purpose: values.purpose || undefined,
                scheduledAt,
                notes: values.notes || undefined,
                host: values.hostId || undefined,
              });

              toast.success("Appointment created");
            } catch (e) {
              toast.error(apiErrorMessage(e, "Failed to create appointment"));
            }
          }}
        />
      </Card>
    </AppShell>
  );
}
