import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Disputes
import Disputes from "./pages/disputes/Disputes";
import RaiseDispute from "./pages/disputes/RaiseDispute";
import DisputeDetails from "./pages/disputes/DisputeDetails";

// Organizations
import Organizations from "./pages/organizations/Organizations";

// Reports
import Reports from "./pages/reports/Reports";

// Notifications
import Notifications from "./pages/notifications/Notifications";

// Profile
import Profile from "./pages/profile/Profile";

// Settings
import Settings from "./pages/settings/Settings";

// Future
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>

      {/* Default */}

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Authentication */}

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
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* Dashboard */}

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

        {/* Disputes */}

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

        {/* Organizations */}

        <Route
          path="organizations"
          element={<Organizations />}
        />

        {/* Reports */}

        <Route
          path="reports"
          element={<Reports />}
        />

        {/* Notifications */}

        <Route
          path="notifications"
          element={<Notifications />}
        />

        {/* Profile */}

        <Route
          path="profile"
          element={<Profile />}
        />

        {/* Settings */}

        <Route
          path="settings"
          element={<Settings />}
        />

      </Route>

      {/* 404 */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}

export default App;