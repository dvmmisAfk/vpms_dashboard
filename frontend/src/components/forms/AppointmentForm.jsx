// components/forms/AppointmentForm.jsx
import { zodResolver } from "@hookform/resolvers/zod";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../ui/Button.jsx";
import { Input } from "../ui/Input.jsx";

const schema = z.object({
  visitorName: z.string().min(1, "Visitor name is required"),
  visitorEmail: z.union([z.string().email(), z.literal("")]).optional(),
  visitorPhone: z.string().optional(),
  company: z.string().optional(),
  purpose: z.string().optional(),
  scheduledAt: z.string().min(1, "Schedule is required"),
  notes: z.string().optional(),
  hostId: z.string().optional(),
});

export function AppointmentForm({ defaultHostId, loading, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      visitorName: "",
      visitorEmail: "",
      visitorPhone: "",
      company: "",
      purpose: "",
      scheduledAt: "",
      notes: "",
      hostId: defaultHostId || "",
    },
  });

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input label="Visitor name" error={errors.visitorName?.message} {...register("visitorName")} />
      <Input label="Visitor email (optional)" type="email" error={errors.visitorEmail?.message} {...register("visitorEmail")} />
      <Input label="Visitor phone (optional)" error={errors.visitorPhone?.message} {...register("visitorPhone")} />
      <Input label="Company (optional)" error={errors.company?.message} {...register("company")} />
      <Input label="Purpose (optional)" error={errors.purpose?.message} {...register("purpose")} />

      <Input label="Scheduled at (local)" type="datetime-local" error={errors.scheduledAt?.message} {...register("scheduledAt")} />
      <Input label="Notes (optional)" error={errors.notes?.message} {...register("notes")} />

      <Input label="Host user id (optional; defaults to you)" error={errors.hostId?.message} {...register("hostId")} />

      <Button type="submit" className="w-full" loading={loading}>
        Create appointment
      </Button>
    </form>
  );
}

AppointmentForm.propTypes = {
  defaultHostId: PropTypes.string,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};
