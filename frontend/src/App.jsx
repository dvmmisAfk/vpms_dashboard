// main app file - sets up routing and providers
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import AppLayout from './components/layout/AppLayout.jsx'

// pages
import LoginPage from './pages/auth/LoginPage.jsx'
import BootstrapAdminPage from './pages/auth/BootstrapAdminPage.jsx'
import DashboardPage from './pages/admin/DashboardPage.jsx'
import AnalyticsPage from './pages/admin/AnalyticsPage.jsx'
import AuditLogsPage from './pages/admin/AuditLogsPage.jsx'
import ReportsPage from './pages/admin/ReportsPage.jsx'
import UsersPage from './pages/admin/UsersPage.jsx'
import VisitorsListPage from './pages/shared/VisitorsListPage.jsx'
import VisitorDetailPage from './pages/shared/VisitorDetailPage.jsx'
import AppointmentsListPage from './pages/shared/AppointmentsListPage.jsx'
import PassesListPage from './pages/shared/PassesListPage.jsx'
import PublicPassPage from './pages/shared/PublicPassPage.jsx'
import CheckInPage from './pages/security/CheckInPage.jsx'
import PassIssuePage from './pages/security/PassIssuePage.jsx'
import InviteVisitorPage from './pages/employee/InviteVisitorPage.jsx'
import MyAppointmentsPage from './pages/employee/MyAppointmentsPage.jsx'
import MyPassPage from './pages/visitor/MyPassPage.jsx'
import PreRegisterPage from './pages/visitor/PreRegisterPage.jsx'

const queryClient = new QueryClient()

// redirect to login if not authenticated
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // redirect to dashboard if wrong role
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />

  return <AppLayout>{children}</AppLayout>
}

// all the pages
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/bootstrap" element={<BootstrapAdminPage />} />
      <Route path="/pre-register/:token" element={<PreRegisterPage />} />
      <Route path="/pass/:passCode" element={<PublicPassPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['admin', 'security', 'employee']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/visitors"
        element={
          <ProtectedRoute roles={['admin', 'security']}>
            <VisitorsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visitors/:id"
        element={
          <ProtectedRoute roles={['admin', 'security', 'employee']}>
            <VisitorDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppointmentsListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/passes"
        element={
          <ProtectedRoute roles={['admin', 'security']}>
            <PassesListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/check-in"
        element={
          <ProtectedRoute roles={['security']}>
            <CheckInPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/issue-pass"
        element={
          <ProtectedRoute roles={['security']}>
            <PassIssuePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/invite"
        element={
          <ProtectedRoute roles={['employee']}>
            <InviteVisitorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-appointments"
        element={
          <ProtectedRoute roles={['employee']}>
            <MyAppointmentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute roles={['admin']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute roles={['admin']}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute roles={['admin']}>
            <AuditLogsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-pass"
        element={
          <ProtectedRoute roles={['visitor']}>
            <MyPassPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster position="top-right" />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
