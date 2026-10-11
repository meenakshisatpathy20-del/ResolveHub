import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import AuthLayout from "./AuthLayout";
import { Spinner } from "../../components/common/States";
import API, { errorMessage } from "../../services/api";

function VerifyResetOTP() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("resetEmail");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!email) return <Navigate to="/forgot-password" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/password/verify-reset-otp", { email, otp });
      sessionStorage.setItem("resetOTP", otp);
      navigate("/reset-password");
    } catch (error) {
      toast.error(errorMessage(error, "Invalid code."));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await API.post("/password/send-reset-otp", { email });
      toast.success("A new code has been sent.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Check your email"
      subtitle={`Enter the 6-digit code sent to ${email}. It expires in 5 minutes.`}
      footer={
        <>
          Wrong email?{" "}
          <Link to="/forgot-password" className="font-semibold text-blue-600 hover:underline">Change it</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="otp" className="label">Reset code</label>
          <input
            id="otp"
            inputMode="numeric"
            maxLength={6}
            className="input text-center text-lg tracking-[0.5em]"
            placeholder="••••••"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            autoFocus
          />
        </div>
        <button type="submit" className="btn-primary h-11 w-full" disabled={loading || otp.length !== 6}>
          {loading && <Spinner className="h-4 w-4" />}
          Verify code
        </button>
        <button type="button" onClick={resend} disabled={resending} className="btn-ghost w-full">
          {resending ? "Sending…" : "Didn't get it? Resend code"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default VerifyResetOTP;
