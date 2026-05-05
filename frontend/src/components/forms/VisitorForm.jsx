// components/forms/VisitorForm.jsx
import { zodResolver } from "@hookform/resolvers/zod";
import PropTypes from "prop-types";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../ui/Button.jsx";
import { Input } from "../ui/Input.jsx";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  purpose: z.string().optional(),
  host: z.string().min(1, "Host user id is required"),
});

export function VisitorForm({ defaultValues, loading, submitLabel = "Save visitor", onSubmit }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      phone: "",
      company: "",
      purpose: "",
      host: "",
    },
  });

  const onDrop = useCallback(
    (accepted) => {
      const file = accepted?.[0];
      if (!file) return;
      setValue("photo", file, { shouldValidate: true });
    },
    [setValue],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] },
  });

  const photo = watch("photo");

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input label="Full name" error={errors.name?.message} {...register("name")} />
      <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
      <Input label="Company" error={errors.company?.message} {...register("company")} />
      <Input label="Purpose" error={errors.purpose?.message} {...register("purpose")} />

      <Input label="Host user id (Mongo ObjectId)" error={errors.host?.message} {...register("host")} />

      <div>
        <div className="mb-1 text-xs font-semibold text-vpms-muted">Photo upload</div>
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-xl border border-dashed border-vpms-border bg-vpms-bg px-4 py-6 text-center text-sm text-vpms-muted ${isDragActive ? "ring-2 ring-vpms-brand/40" : ""}`}
        >
          <input {...getInputProps()} />
          Drag & drop visitor photo here, or click to browse
          {photo?.name ? <div className="mt-3 text-xs font-semibold text-vpms-text">Selected: {photo.name}</div> : null}
        </div>
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        {submitLabel}
      </Button>
    </form>
  );
}

VisitorForm.propTypes = {
  defaultValues: PropTypes.object,
  loading: PropTypes.bool,
  submitLabel: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
};
