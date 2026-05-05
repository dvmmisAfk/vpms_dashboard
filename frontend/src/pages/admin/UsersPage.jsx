// pages/admin/UsersPage.jsx
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { registerUser } from "../../api/auth.js";
import { AppShell } from "../../components/layout/AppShell.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { apiErrorMessage } from "../../utils/apiError.js";
import { ROLES } from "../../utils/constants.js";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum([ROLES.ADMIN, ROLES.SECURITY, ROLES.EMPLOYEE, ROLES.VISITOR]),
  phone: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
});

export default function UsersPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: ROLES.EMPLOYEE,
      phone: "",
      department: "",
      location: "hq",
    },
  });

  return (
    <AppShell title="Users" breadcrumbs={["Admin", "Users"]}>
      <PageHeader title="User provisioning" subtitle="Registers a new VPMS account (requires your admin JWT on the backend)." />

      <Card>
        <form
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
          onSubmit={handleSubmit(async (values) => {
            try {
              await registerUser(values);
              toast.success("User created");
              reset();
            } catch (e) {
              toast.error(apiErrorMessage(e, "Failed to register user"));
            }
          })}
          noValidate
        >
          <Input label="Full name" error={errors.name?.message} {...register("name")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />

          <Input label="Temporary password" type="password" error={errors.password?.message} {...register("password")} />

          <label className="block text-left md:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-vpms-muted">Role</span>
            <select
              className="w-full rounded-lg bg-vpms-surface px-3 py-2 text-sm text-vpms-text ring-1 ring-vpms-border focus:outline-none focus:ring-2 focus:ring-vpms-brand/40"
              {...register("role")}
            >
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.role?.message ? <span className="mt-1 block text-xs text-vpms-danger">{errors.role.message}</span> : null}
          </label>

          <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
          <Input label="Department" error={errors.department?.message} {...register("department")} />

          <Input className="md:col-span-2" label="Location" error={errors.location?.message} {...register("location")} />

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" loading={isSubmitting}>
              Create user
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
