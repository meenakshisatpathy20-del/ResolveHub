import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import AuthLayout from "./AuthLayout";
import PasswordInput from "../../components/common/PasswordInput";
import { Spinner } from "../../components/common/States";
import API, { errorMessage } from "../../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("resetEmail");
  const otp = sessionStorage.getItem("resetOTP");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email || !otp) return <Navigate to="/forgot-password" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      await API.post("/password/reset-password", { email, otp, newPassword: password });
      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetOTP");
      toast.success("Password updated. Please log in with your new password.");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Could not reset the password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle={`For ${email}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div>
          <label htmlFor="password" className="label">New password</label>
          <PasswordInput id="password" autoComplete="new-password" placeholder="Min. 8 characters" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} autoFocus />
        </div>
        <div>
          <label htmlFor="confirm" className="label">Confirm new password</label>
          <PasswordInput id="confirm" autoComplete="new-password" placeholder="Repeat password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(""); }} />
        </div>
        <button type="submit" className="btn-primary h-11 w-full" disabled={loading}>
          {loading && <Spinner className="h-4 w-4" />}
          Update password
        </button>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
