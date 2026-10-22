import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import AuthLayout from "./AuthLayout";
import GoogleSignIn from "./GoogleSignIn";
import DemoLogin from "./DemoLogin";
import PasswordInput from "../../components/common/PasswordInput";
import { Spinner } from "../../components/common/States";
import API, { errorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = location.state?.from || "/dashboard";

  useEffect(() => {
    if (params.get("expired")) {
      toast.info("Your session expired. Please log in again.");
    }
  }, [params]);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const loginWith = async (email, password) => {
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      toast.success(`Welcome, ${res.data.user.fullName.split(" ")[0]}!`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Login failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginWith(form.email, form.password);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to track and resolve your payment disputes."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-blue-600 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <DemoLogin onLogin={loginWith} disabled={loading} />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-primary h-11 w-full" disabled={loading || !form.email || !form.password}>
          {loading && <Spinner className="h-4 w-4" />}
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <GoogleSignIn redirectTo={redirectTo} />
    </AuthLayout>
  );
}

export default Login;
