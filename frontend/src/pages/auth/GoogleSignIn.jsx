import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import API, { errorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

// Renders nothing when VITE_GOOGLE_CLIENT_ID is not configured
function GoogleSignIn({ redirectTo = "/dashboard" }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return null;

  const handleSuccess = async ({ credential }) => {
    try {
      const res = await API.post("/google/google", { credential });
      login(res.data.user, res.data.token);
      toast.success(`Welcome, ${res.data.user.fullName.split(" ")[0]}!`);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(errorMessage(error, "Google sign-in failed."));
    }
  };

  return (
    <>
      <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => toast.error("Google sign-in was cancelled or failed.")}
          width="360"
          shape="pill"
          text="continue_with"
        />
      </div>
    </>
  );
}

export default GoogleSignIn;
