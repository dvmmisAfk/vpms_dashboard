// pages/auth/BootstrapAdminPage.jsx
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { bootstrapAdmin } from "../../api/bootstrap.js";
import { AuthPageShell } from "../../components/layout/AuthPageShell.jsx";
import { apiErrorMessage } from "../../utils/apiError.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(12),
});

export default function BootstrapAdminPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  return (
    <AuthPageShell>
      <Card title="Bootstrap VPMS" subtitle="Create the first admin account (only works when no admin exists).">
        <form
          className="space-y-3"
          onSubmit={handleSubmit(async (values) => {
            try {
              await bootstrapAdmin(values);
              toast.success("Admin created. Please sign in.");
              navigate("/login");
            } catch (e) {
              toast.error(apiErrorMessage(e, "Bootstrap failed"));
            }
          })}
          noValidate
        >
          <Input label="Admin name" error={errors.name?.message} {...register("name")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Create admin
          </Button>

          <div className="pt-2 text-center text-xs text-vpms-muted">
            Already onboarded?{" "}
            <Link className="font-semibold text-vpms-brand underline" to="/login">
              Sign in
            </Link>
          </div>
        </form>
      </Card>
    </AuthPageShell>
  );
}
