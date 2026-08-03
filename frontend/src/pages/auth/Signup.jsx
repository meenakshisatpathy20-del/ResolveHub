import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Phone,
  Building2,
  Lock,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import API from "../../services/api";

function Signup() {
  const navigate = useNavigate();

  // =========================
  // Form Data
  // =========================

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    organizationName: "",
    organizationType: "",
    password: "",
    confirmPassword: "",
  });

  // =========================
  // Loading
  // =========================

  const [loading, setLoading] = useState(false);

  // =========================
  // Password Visibility
  // =========================

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =========================
  // Password Strength
  // =========================

  const [passwordStrength, setPasswordStrength] =
    useState(0);

  // =========================
  // Email Verification
  // =========================

  const [emailVerified, setEmailVerified] =
    useState(false);

  const [showEmailOTPModal, setShowEmailOTPModal] =
    useState(false);

  const [emailOTP, setEmailOTP] = useState("");

  const [generatedEmailOTP, setGeneratedEmailOTP] =
    useState("");

  // =========================
  // Phone Verification
  // =========================

  const [phoneVerified, setPhoneVerified] =
    useState(false);

  const [showPhoneOTPModal, setShowPhoneOTPModal] =
    useState(false);

  const [phoneOTP, setPhoneOTP] = useState("");

  const [generatedPhoneOTP, setGeneratedPhoneOTP] =
    useState("");

  // =========================
  // CAPTCHA
  // =========================

  const [captcha, setCaptcha] = useState("");

  const [captchaInput, setCaptchaInput] = useState("");

  // =========================
  // Terms & Conditions
  // =========================

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  // =========================
  // Change Handler
  // =========================

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  // =========================
// Password Strength
// =========================

useEffect(() => {
  let strength = 0;

  if (formData.password.length >= 8) strength++;
  if (/[A-Z]/.test(formData.password)) strength++;
  if (/[a-z]/.test(formData.password)) strength++;
  if (/[0-9]/.test(formData.password)) strength++;
  if (/[^A-Za-z0-9]/.test(formData.password)) strength++;

  setPasswordStrength(strength);
}, [formData.password]);

// =========================
// Generate CAPTCHA
// =========================

const generateCaptcha = () => {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let value = "";

  for (let i = 0; i < 6; i++) {
    value += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  setCaptcha(value);
};

useEffect(() => {
  generateCaptcha();
}, []);

// =========================
// Send Email OTP
// =========================

const sendEmailOTP = async () => {
  if (!formData.email) {
    alert("Enter email first");
    return;
  }

  try {
    setLoading(true);

    await API.post("/otp/send-email-otp", {
      email: formData.email,
    });

    setShowEmailOTPModal(true);

    alert("OTP sent to your email.");
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Failed to send OTP"
    );
  } finally {
    setLoading(false);
  }
};

// =========================
// Verify Email OTP
// =========================

const verifyEmailOTP = async () => {
  try {
    setLoading(true);

    const res = await API.post(
      "/otp/verify-email-otp",
      {
        email: formData.email,
        otp: emailOTP,
      }
    );

    if (res.data.success) {
      setEmailVerified(true);
      setShowEmailOTPModal(false);

      alert("Email Verified Successfully");
    }
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Invalid OTP"
    );
  } finally {
    setLoading(false);
  }
};

// =========================
// Register User
// =========================

const handleSignup = async (e) => {
  e.preventDefault();

  if (!emailVerified) {
    alert("Verify your email first.");
    return;
  }

  if (
    formData.password !==
    formData.confirmPassword
  ) {
    alert("Passwords do not match.");
    return;
  }

  if (!acceptedTerms) {
    alert("Accept Terms & Conditions");
    return;
  }

  if (captcha !== captchaInput) {
    alert("Invalid CAPTCHA");
    generateCaptcha();
    return;
  }

  try {
    setLoading(true);

    const res = await API.post(
      "/auth/register",
      formData
    );

    localStorage.setItem(
      "token",
      res.data.token
    );

    navigate("/dashboard");
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Registration Failed"
    );
  } finally {
    setLoading(false);
  }
};