import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const app = (
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
    ) : (
      app
    )}
  </React.StrictMode>
);
