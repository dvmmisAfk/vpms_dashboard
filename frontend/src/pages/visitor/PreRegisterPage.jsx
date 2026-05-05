// pages/visitor/PreRegisterPage.jsx
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";

import { completePreRegistration } from "../../api/appointments.js";
import { AuthPageShell } from "../../components/layout/AuthPageShell.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { apiErrorMessage } from "../../utils/apiError.js";

const schema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  purpose: z.string().optional(),
});

export default function PreRegisterPage() {
  const { token } = useParams();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", company: "", purpose: "" },
  });

  const photo = watch("photo");

  const onDrop = useMemo(() => {
    return (accepted) => {
      const file = accepted?.[0];
      if (!file) return;
      setValue("photo", file, { shouldValidate: true });
    };
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] },
  });

  return (
    <AuthPageShell contentClassName="max-w-lg">
      <Card title="Pre-register your visit" subtitle="Complete your profile and upload a photo for badge printing.">
        <form
          className="space-y-3"
          onSubmit={handleSubmit(async (values) => {
            try {
              const fd = new FormData();
              if (values.name) fd.append("name", values.name);
              if (values.phone) fd.append("phone", values.phone);
              if (values.company) fd.append("company", values.company);
              if (values.purpose) fd.append("purpose", values.purpose);
              if (values.photo) fd.append("photo", values.photo);

              await completePreRegistration(token, fd);
              toast.success("Pre-registration submitted");
            } catch (e) {
              toast.error(apiErrorMessage(e, "Failed to submit"));
            }
          })}
          noValidate
        >
          <Input label="Full name (optional updates)" error={errors.name?.message} {...register("name")} />
          <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
          <Input label="Company" error={errors.company?.message} {...register("company")} />
          <Input label="Purpose" error={errors.purpose?.message} {...register("purpose")} />

          <div>
            <div className="mb-1 text-xs font-semibold text-vpms-muted">Visitor photo</div>
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-xl border border-dashed border-vpms-border bg-vpms-bg px-4 py-6 text-center text-sm text-vpms-muted ${isDragActive ? "ring-2 ring-vpms-brand/40" : ""}`}
            >
              <input {...getInputProps()} />
              Upload a clear headshot (used on the printed badge)
              {photo?.name ? <div className="mt-3 text-xs font-semibold text-vpms-text">Selected: {photo.name}</div> : null}
            </div>
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Submit
          </Button>
        </form>
      </Card>
    </AuthPageShell>
  );
}
