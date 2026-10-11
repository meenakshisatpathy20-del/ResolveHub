import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_URL,
});

// =============================
// Attach JWT Automatically
// =============================

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =============================
// Expired / invalid session → back to login
// (not for the login request itself, which returns 401 on a wrong password)
// =============================

API.interceptors.response.use(
  (response) => response,

  (error) => {
    const isAuthCall = error.config?.url?.startsWith("/auth/login");

    if (
      error.response?.status === 401 &&
      !isAuthCall &&
      localStorage.getItem("token")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login?expired=1";
    }

    return Promise.reject(error);
  }
);

// Readable message from an API error
export const errorMessage = (error, fallback = "Something went wrong.") => {
  if (!error?.response) {
    return "Cannot reach the server. Check your connection and try again.";
  }

  return error.response?.data?.message || fallback;
};

export default API;
