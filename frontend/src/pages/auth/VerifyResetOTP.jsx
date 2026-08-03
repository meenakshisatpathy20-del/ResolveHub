import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function VerifyResetOTP() {
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  const [otp, setOTP] = useState("");

  const [loading, setLoading] = useState(false);

  const verifyOTP = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await API.post("/password/verify-reset-otp", {
        email,
        otp,
      });

      localStorage.setItem("resetOTP", otp);

      alert("OTP Verified");

      navigate("/reset-password");

    } catch (err) {

      alert(
        err.response?.data?.message ||
          "Invalid OTP"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="text-3xl font-bold">
          Verify OTP
        </h1>

        <p className="mt-2 mb-6 text-slate-500">
          Enter the OTP sent to your email.
        </p>

        <form
          onSubmit={verifyOTP}
          className="space-y-5"
        >

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) =>
              setOTP(e.target.value)
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
              ? "Verifying..."
              : "Verify OTP"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default VerifyResetOTP;