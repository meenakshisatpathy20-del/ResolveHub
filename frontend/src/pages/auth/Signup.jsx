import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CheckCircle2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "./AuthLayout";
import GoogleSignIn from "./GoogleSignIn";
import PasswordInput from "../../components/common/PasswordInput";
import { Spinner } from "../../components/common/States";
import API, { errorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

const STRENGTH = [
  { label: "Too weak", color: "bg-red-500" },
  { label: "Weak", color: "bg-red-500" },
  { label: "Fair", color: "bg-amber-500" },
  { label: "Good", color: "bg-lime-500" },
  { label: "Strong", color: "bg-emerald-500" },
  { label: "Very strong", color: "bg-emerald-600" },
];

const passwordScore = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const FieldError = ({ error }) =>
  error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null;

function Signup() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const score = useMemo(() => passwordScore(form.password), [form.password]);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Changing the email means it must be verified again
    if (name === "email" && (otpSent || emailVerified)) {
      setOtpSent(false);
      setEmailVerified(false);
      setOtp("");
    }
  };

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const sendOtp = async () => {
    if (!validEmail) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid email address." }));
      return;
    }

    setSending(true);
    try {
      await API.post("/otp/send-email-otp", { email: form.email });
      setOtpSent(true);
      setCooldown(60);
      toast.success(`Verification code sent to ${form.email}`);
    } catch (error) {
      setErrors((prev) => ({ ...prev, email: errorMessage(error, "Could not send the code.") }));
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    setVerifying(true);
    try {
      await API.post("/otp/verify-email-otp", { email: form.email, otp });
      setEmailVerified(true);
      toast.success("Email verified");
    } catch (error) {
      setErrors((prev) => ({ ...prev, otp: errorMessage(error, "Invalid code.") }));
    } finally {
      setVerifying(false);
    }
  };

  const validate = () => {
    const next = {};
    if (form.fullName.trim().length < 2) next.fullName = "Enter your full name.";
    if (!emailVerified) next.email = "Please verify your email to continue.";
    if (form.phoneNumber && !/^[0-9+\-\s]{7,15}$/.test(form.phoneNumber))
      next.phoneNumber = "Enter a valid phone number.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match.";
    if (!acceptedTerms) next.terms = "Please accept the terms to continue.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await API.post("/auth/register", {
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
      });
      login(res.data.user, res.data.token);
      toast.success("Account created. Welcome to ResolveHub!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(errorMessage(error, "Registration failed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Raise and track payment disputes with merchants, banks and gateways."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="fullName" className="label">Full name</label>
          <input id="fullName" name="fullName" className="input" autoComplete="name" placeholder="As on your bank account" value={form.fullName} onChange={handleChange} />
          <FieldError error={errors.fullName} />
        </div>

        {/* Email + OTP */}
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={cn("input", emailVerified && "border-emerald-400 pr-10")}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
              {emailVerified && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-emerald-500" />}
            </div>
            {!emailVerified && (
              <button type="button" onClick={sendOtp} className="btn-secondary h-11 shrink-0" disabled={sending || cooldown > 0 || !form.email}>
                {sending ? <Spinner className="h-4 w-4" /> : cooldown > 0 ? `Resend in ${cooldown}s` : otpSent ? "Resend code" : "Send code"}
              </button>
            )}
          </div>
          <FieldError error={errors.email} />

          {otpSent && !emailVerified && (
            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
              <p className="mb-2 flex items-center gap-2 text-sm text-slate-700">
                <MailCheck className="h-4 w-4 text-blue-600" /> Enter the 6-digit code we emailed you.
              </p>
              <div className="flex gap-2">
                <input
                  inputMode="numeric"
                  maxLength={6}
                  className="input tracking-[0.4em]"
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    setErrors((prev) => ({ ...prev, otp: "" }));
                  }}
                  aria-label="Verification code"
                />
                <button type="button" onClick={verifyOtp} className="btn-primary h-11 shrink-0" disabled={otp.length !== 6 || verifying}>
                  {verifying ? <Spinner className="h-4 w-4" /> : "Verify"}
                </button>
              </div>
              <FieldError error={errors.otp} />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="label">
            Phone number <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input id="phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" className="input" placeholder="+91 98765 43210" value={form.phoneNumber} onChange={handleChange} />
          <FieldError error={errors.phoneNumber} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="label">Password</label>
            <PasswordInput id="password" name="password" autoComplete="new-password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} />
            <FieldError error={errors.password} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="label">Confirm password</label>
            <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
            <FieldError error={errors.confirmPassword} />
          </div>
        </div>

        {form.password && (
          <div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= score ? STRENGTH[score].color : "bg-slate-200")} />
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Strength: <span className="font-medium">{STRENGTH[score].label}</span> — mix upper/lowercase, numbers and symbols.
            </p>
          </div>
        )}

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                setErrors((prev) => ({ ...prev, terms: "" }));
              }}
            />
            I agree to the Terms of Service and Privacy Policy, and confirm the information I provide is accurate.
          </label>
          <FieldError error={errors.terms} />
        </div>

        <button type="submit" className="btn-primary h-11 w-full" disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4" />}
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <GoogleSignIn />
    </AuthLayout>
  );
}

export default Signup;
