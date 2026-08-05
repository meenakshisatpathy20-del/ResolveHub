import { Routes, Route, Navigate } from "react-router-dom";

// Authentication
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyResetOTP from "./pages/auth/VerifyResetOTP";
import ResetPassword from "./pages/auth/ResetPassword";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Customer Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Organization Dashboard
import OrganizationDashboard from "./pages/dashboard/OrganizationDashboard";

// Admin Dashboard
import AdminDashboard from "./pages/dashboard/AdminDashboard";

// Disputes
import Disputes from "./pages/disputes/Disputes";
import RaiseDispute from "./pages/disputes/RaiseDispute";
import DisputeDetails from "./pages/disputes/DisputeDetails";

// Other Pages
import Organizations from "./pages/organizations/Organizations";
import Reports from "./pages/reports/Reports";
import Notifications from "./pages/notifications/Notifications";
import Settings from "./pages/settings/Settings";
import Support from "./pages/support/Support";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";

// Auth
import { useAuth } from "./context/AuthContext";

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "Admin") {
    return <AdminDashboard />;
  }

  if (
    user.role === "OrganizationAdmin" ||
    user.role === "Employee"
  ) {
    return <OrganizationDashboard />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <Routes>

      {/* Public */}

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

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

      {/* Protected */}

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
          element={<DashboardRouter />}
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

        <Route
          path="support"
          element={<Support />}
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default App;