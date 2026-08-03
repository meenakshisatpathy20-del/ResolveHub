import { Routes, Route, Navigate } from "react-router-dom";

// Authentication
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyResetOTP from "./pages/auth/VerifyResetOTP";
import ResetPassword from "./pages/auth/ResetPassword";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Disputes
import Disputes from "./pages/disputes/Disputes";
import RaiseDispute from "./pages/disputes/RaiseDispute";
import DisputeDetails from "./pages/disputes/DisputeDetails";

// Other Pages
import Organizations from "./pages/organizations/Organizations";
import Reports from "./pages/reports/Reports";
import Notifications from "./pages/notifications/Notifications";
import Settings from "./pages/settings/Settings";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* ================= Public Routes ================= */}

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/verify-reset-otp"
        element={<VerifyResetOTP />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* ================= Protected Routes ================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<Dashboard />}
        />

        <Route
          path="disputes"
          element={<Disputes />}
        />

        <Route
          path="raise-dispute"
          element={<RaiseDispute />}
        />

        <Route
          path="disputes/:id"
          element={<DisputeDetails />}
        />

        <Route
          path="organizations"
          element={<Organizations />}
        />

        <Route
          path="reports"
          element={<Reports />}
        />

        <Route
          path="notifications"
          element={<Notifications />}
        />

        <Route
          path="settings"
          element={<Settings />}
        />

      </Route>

      {/* ================= 404 ================= */}

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default App;