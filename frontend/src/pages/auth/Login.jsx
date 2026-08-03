import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Shield } from "lucide-react";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await API.post("/auth/login", {
        email,
        password,
      });

      login(response.data.user, response.data.token);

      navigate("/dashboard");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">

      {/* Left Panel */}

      <div className="hidden w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 lg:flex flex-col justify-center px-20 text-white">

        <div className="mb-10 flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-bold">
            R
          </div>

          <div>

            <h1 className="text-4xl font-bold">
              ResolveHub
            </h1>

            <p className="text-slate-300">
              Unified Dispute Resolution Platform
            </p>

          </div>

        </div>

        <h2 className="text-6xl font-bold leading-tight">
          Resolve financial disputes
          <br />
          faster and smarter.
        </h2>

        <p className="mt-8 max-w-xl text-xl leading-9 text-slate-300">
          One secure platform connecting customers, banks,
          merchants, payment gateways and logistics partners
          throughout the entire dispute lifecycle.
        </p>

      </div>

      {/* Right Panel */}

      <div className="flex flex-1 items-center justify-center bg-slate-100 px-6">

        <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">

          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">

            <Shield size={30} className="text-white" />

          </div>

          <h2 className="text-3xl font-bold text-slate-900">
            Welcome Back
          </h2>

          <p className="mt-2 text-slate-500">
            Sign in to your ResolveHub account.
          </p>

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-6"
          >

            <div>

              <label className="mb-2 block font-medium">
                Email
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4 outline-none focus:border-blue-600"
                  required
                />

              </div>

            </div>

            <div>

              <label className="mb-2 block font-medium">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4 outline-none focus:border-blue-600"
                  required
                />

              </div>

            </div>

            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2">

                <input type="checkbox" />

                Remember me

              </label>

              <button
                type="button"
                className="text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="border-t pt-6 text-center">

              <p className="text-slate-600">
                Don't have an account?
              </p>

              <Link
                to="/signup"
                className="mt-3 inline-block rounded-xl border border-blue-600 px-6 py-2 font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
              >
                Create Account
              </Link>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;