// pages/auth/BootstrapAdminPage.jsx
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { bootstrapAdmin } from "../../api/bootstrap.js";
import { AuthPageShell } from "../../components/layout/AuthPageShell.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";

export default function BootstrapAdminPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
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
              toast.error(e?.response?.data?.message || "Bootstrap failed");
            }
          })}
          noValidate
        >
          <Input
            label="Admin name"
            error={errors.name?.message}
            {...register("name", { required: "Name is required" })}
          />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email", { required: "Email is required" })}
          />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 12, message: "Password must be at least 12 characters" }
            })}
          />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Create admin
          </Button>

          <div className="pt-2 text-center text-xs text-slate-500">
            Already onboarded?{" "}
            <Link className="font-semibold text-indigo-600 underline" to="/login">
              Sign in
            </Link>
          </div>
        </form>
      </Card>
    </AuthPageShell>
  );
}
