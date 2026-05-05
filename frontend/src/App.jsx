// App.jsx
import { Navigate, Route, Routes } from "react-router-dom";

import HomeRedirect from "./components/layout/HomeRedirect.jsx";
import { ProtectedRoute } from "./components/layout/ProtectedRoute.jsx";
import AnalyticsPage from "./pages/admin/AnalyticsPage.jsx";
import AuditLogsPage from "./pages/admin/AuditLogsPage.jsx";
import DashboardPage from "./pages/admin/DashboardPage.jsx";
import ReportsPage from "./pages/admin/ReportsPage.jsx";
import UsersPage from "./pages/admin/UsersPage.jsx";
import BootstrapAdminPage from "./pages/auth/BootstrapAdminPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import InviteVisitorPage from "./pages/employee/InviteVisitorPage.jsx";
import MyAppointmentsPage from "./pages/employee/MyAppointmentsPage.jsx";
import CheckInPage from "./pages/security/CheckInPage.jsx";
import PassIssuePage from "./pages/security/PassIssuePage.jsx";
import AppointmentsListPage from "./pages/shared/AppointmentsListPage.jsx";
import PassesListPage from "./pages/shared/PassesListPage.jsx";
import PublicPassPage from "./pages/shared/PublicPassPage.jsx";
import VisitorDetailPage from "./pages/shared/VisitorDetailPage.jsx";
import VisitorsListPage from "./pages/shared/VisitorsListPage.jsx";
import MyPassPage from "./pages/visitor/MyPassPage.jsx";
import PreRegisterPage from "./pages/visitor/PreRegisterPage.jsx";
import { ROLES } from "./utils/constants.js";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/bootstrap" element={<BootstrapAdminPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/pre-register/:token" element={<PreRegisterPage />} />
      <Route path="/pass/:passCode" element={<PublicPassPage />} />

      <Route element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.SECURITY, ROLES.EMPLOYEE]} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/appointments" element={<AppointmentsListPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.SECURITY]} />}>
        <Route path="/visitors" element={<VisitorsListPage />} />
        <Route path="/visitors/:id" element={<VisitorDetailPage />} />
        <Route path="/passes" element={<PassesListPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={[ROLES.SECURITY]} />}>
        <Route path="/check-in" element={<CheckInPage />} />
        <Route path="/issue-pass" element={<PassIssuePage />} />
      </Route>

      <Route element={<ProtectedRoute roles={[ROLES.EMPLOYEE]} />}>
        <Route path="/invite" element={<InviteVisitorPage />} />
        <Route path="/my-appointments" element={<MyAppointmentsPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={[ROLES.VISITOR]} />}>
        <Route path="/my-pass" element={<MyPassPage />} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
