// pages/auth/LoginPage.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import { AuthPageShell } from "../../components/layout/AuthPageShell.jsx";
import HomeRedirect from "../../components/layout/HomeRedirect.jsx";
import { LoginForm } from "../../components/forms/LoginForm.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiErrorMessage } from "../../utils/apiError.js";
import { ROLES } from "../../utils/constants.js";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <HomeRedirect />;

  return (
    <AuthPageShell contentClassName="max-w-md space-y-4">
      <div className="text-center">
        <div className="text-sm font-semibold text-vpms-muted">Visitor pass management</div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-vpms-text">VPMS</h1>
      </div>

      <Card title="Sign in" subtitle="Use credentials issued by your administrator.">
        <LoginForm
          loading={submitting}
          onSubmit={async (values) => {
            setSubmitting(true);
            try {
              const u = await login(values);
              toast.success("Signed in");
              navigate(u?.role === ROLES.VISITOR ? "/my-pass" : "/dashboard");
            } catch (e) {
              toast.error(apiErrorMessage(e, "Login failed"));
            } finally {
              setSubmitting(false);
            }
          }}
        />

        <div className="mt-4 text-center text-xs text-vpms-muted">
          First deployment?{" "}
          <Link className="font-semibold text-vpms-brand underline" to="/bootstrap">
            Bootstrap admin
          </Link>
        </div>
      </Card>
    </AuthPageShell>
  );
}
