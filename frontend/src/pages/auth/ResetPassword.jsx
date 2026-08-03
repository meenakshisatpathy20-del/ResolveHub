import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function ResetPassword() {
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");
  const otp = localStorage.getItem("resetOTP");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match.");
    }

    if (newPassword.length < 6) {
      return alert(
        "Password must be at least 6 characters."
      );
    }

    try {
      setLoading(true);

      await API.post("/password/reset-password", {
        email,
        otp,
        newPassword,
      });

      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetOTP");

      alert("Password Reset Successful.");

      navigate("/login");

    } catch (err) {

      alert(
        err.response?.data?.message ||
          "Unable to reset password."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="text-3xl font-bold">
          Reset Password
        </h1>

        <p className="mb-6 mt-2 text-slate-500">
          Create a new password for your account.
        </p>

        <form
          onSubmit={handleResetPassword}
          className="space-y-5"
        >

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            className="h-12 w-full rounded-xl border border-slate-300 px-4"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            className="h-12 w-full rounded-xl border border-slate-300 px-4"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default ResetPassword;