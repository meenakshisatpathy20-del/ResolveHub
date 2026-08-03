import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await API.post(
        "/password/send-reset-otp",
        {
          email,
        }
      );

      localStorage.setItem(
        "resetEmail",
        email
      );

      alert("OTP sent successfully.");

      navigate("/verify-reset-otp");

    } catch (err) {

      alert(
        err.response?.data?.message ||
          "Unable to send OTP."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="mb-2 text-3xl font-bold">
          Forgot Password
        </h1>

        <p className="mb-6 text-slate-500">
          Enter your registered email.
        </p>

        <form
          onSubmit={handleSendOTP}
          className="space-y-5"
        >

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="h-12 w-full rounded-xl border border-slate-300 px-4"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white"
          >
            {loading
              ? "Sending OTP..."
              : "Send OTP"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default ForgotPassword;