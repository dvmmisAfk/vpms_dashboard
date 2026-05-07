// pages/admin/UsersPage.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

import { registerUser } from "../../api/auth.js";
import { AppShell } from "../../components/layout/AppShell.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";

export default function UsersPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "employee",
      phone: "",
      department: "",
      location: "hq",
    },
  });

  const onSubmit = async (values) => {
    try {
      await registerUser(values);
      toast.success("User created");
      reset();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <AppShell title="Users" breadcrumbs={["Admin", "Users"]}>
      <PageHeader title="User provisioning" subtitle="Add a new user account to the system." />

      <Card>
        <form
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Input
            label="Full name"
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
            {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 chars" } })}
          />

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Role</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              {...register("role")}
            >
              <option value="admin">admin</option>
              <option value="security">security</option>
              <option value="employee">employee</option>
              <option value="visitor">visitor</option>
            </select>
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
          </div>

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
