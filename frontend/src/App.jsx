import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Authentication
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyResetOTP from "./pages/auth/VerifyResetOTP";
import ResetPassword from "./pages/auth/ResetPassword";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Disputes from "./pages/disputes/Disputes";
import RaiseDispute from "./pages/disputes/RaiseDispute";
import DisputeDetails from "./pages/disputes/DisputeDetails";
import Organizations from "./pages/organizations/Organizations";
import Team from "./pages/team/Team";
import Notifications from "./pages/notifications/Notifications";
import Settings from "./pages/settings/Settings";
import Support from "./pages/support/Support";
import { PageLoader } from "./components/common/States";

// Charts library is large, so the reports page loads on demand
const Reports = lazy(() => import("./pages/reports/Reports"));

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="disputes" element={<Disputes />} />
        <Route path="disputes/:id" element={<DisputeDetails />} />
        <Route
          path="raise-dispute"
          element={
            <ProtectedRoute roles={["Customer"]}>
              <RaiseDispute />
            </ProtectedRoute>
          }
        />
        <Route
          path="organizations"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <Organizations />
            </ProtectedRoute>
          }
        />
        <Route
          path="team"
          element={
            <ProtectedRoute roles={["OrganizationAdmin"]}>
              <Team />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <Suspense fallback={<PageLoader />}>
              <Reports />
            </Suspense>
          }
        />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="support" element={<Support />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
