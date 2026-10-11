import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "./AuthLayout";
import { Spinner } from "../../components/common/States";
import API, { errorMessage } from "../../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/password/send-reset-otp", { email });
      sessionStorage.setItem("resetEmail", email.trim().toLowerCase());
      toast.success(res.data.message);
      navigate("/verify-reset-otp");
    } catch (error) {
      toast.error(errorMessage(error, "Unable to send the code."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your registered email and we'll send you a 6-digit reset code."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input id="email" type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </div>
        <button type="submit" className="btn-primary h-11 w-full" disabled={loading || !email}>
          {loading && <Spinner className="h-4 w-4" />}
          {loading ? "Sending code…" : "Send reset code"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;
