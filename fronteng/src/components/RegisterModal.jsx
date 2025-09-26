import React, { useState, useEffect } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import SignupImage from "../assets/signup.png"; 

export default function RegisterModal({ isOpen, onClose, redirectTo = null }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone: "",
      });
      setError("");
      setLoading(false);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const finishSuccess = () => {
    setSuccess(false);
    onClose?.();

    // redirectTo may be a string path or a location-like object
    if (redirectTo) {
      if (typeof redirectTo === "string") {
        navigate(redirectTo, { replace: true });
      } else if (redirectTo.pathname) {
        navigate(redirectTo.pathname + (redirectTo.search || ""), {
          replace: true,
          state: redirectTo.state || undefined,
        });
      } else {
        navigate("/", { replace: true });
      }
    } else {
      navigate("/", { replace: true });
    }
  };

  // --- Robust handleSubmit: register, try token with email then fallback to username ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1) create user
      await api.post("/account/register/", form);

      // 2) attempt token obtain: try email first, then fallback to username
      let tokenRes = null;
      try {
        tokenRes = await api.post("/token/", {
          email: form.email,
          password: form.password,
        });
      } catch (tokenErr) {
        const status = tokenErr.response?.status;
        if (status === 400 || status === 401 || status === 403) {
          // fallback to username
          tokenRes = await api.post("/token/", {
            username: form.username,
            password: form.password,
          });
        } else {
          // unknown error, rethrow
          throw tokenErr;
        }
      }

      if (!tokenRes || !tokenRes.data) {
        throw new Error("Failed to obtain auth token");
      }

      // 3) save tokens using same keys as Login page (access / refresh)
      localStorage.setItem("access", tokenRes.data.access);
      if (tokenRes.data.refresh) localStorage.setItem("refresh", tokenRes.data.refresh);

      // set axios default header for immediate authenticated requests
      api.defaults.headers.common["Authorization"] = `Bearer ${tokenRes.data.access}`;

      // notify other components (if they listen)
      try {
        window.dispatchEvent(new Event("authChanged"));
      } catch (_) {}

      // 4) fetch the logged-in user's profile
      const meRes = await api.get("/account/me/");
      localStorage.setItem("user", JSON.stringify(meRes.data));

      // show success overlay/modal
      setSuccess(true);

      // small delay so user sees success then redirect (keeps your UX)
      setTimeout(() => {
        finishSuccess();
      }, 1200);
    } catch (err) {
      // Build a helpful error message from the response
      const data = err.response?.data;
      let msg = "Registration failed";

      if (!data) {
        msg = err.message || msg;
      } else if (typeof data === "string") {
        msg = data;
      } else if (data.detail) {
        msg = data.detail;
      } else {
        // collect field errors into a readable string
        const parts = [];
        Object.entries(data).forEach(([key, val]) => {
          if (Array.isArray(val)) parts.push(`${key}: ${val.join(" ")}`);
          else if (typeof val === "object") parts.push(`${key}: ${JSON.stringify(val)}`);
          else parts.push(`${key}: ${val}`);
        });
        if (parts.length) msg = parts.join(" • ");
        else msg = JSON.stringify(data);
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center py-2">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* modal card */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-[600px] mt-10 overflow-hidden">
        {/* Top semicircles */}
        <div className="absolute left-0 right-0 -top-4 pointer-events-none overflow-hidden h-14 md:h-20">
          <div
            className="flex items-center -space-x-4"
            style={{ transform: "translateY(-50%)" }}
          >
            <div className="w-16 h-16 md:w-32 md:h-32 rounded-full bg-[#98FB98] -ml-6" />
            <div className="w-16 h-16 md:w-32 md:h-32 rounded-full bg-[#98FB98]" />
            <div className="w-16 h-16 md:w-32 md:h-32 rounded-full bg-[#98FB98]" />
            <div className="w-16 h-16 md:w-32 md:h-32 rounded-full bg-[#98FB98]" />
            <div className="w-16 h-16 md:w-32 md:h-32 rounded-full bg-[#98FB98]" />
            <div className="w-16 h-16 md:w-32 md:h-32 rounded-full bg-[#98FB98] -mr-6" />
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl w-8 h-8 rounded-full flex items-center justify-center border bg-white z-10"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal content */}
        <div className="pt-8 md:pt-10 pb-24">
          <h3 className="text-lg font-bold mb-4 text-center">
            Sign up for a free account at petpalooza
          </h3>

          {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label className="block text-sm">First Name</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <label className="block mb-2 text-sm">Last Name</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <label className="block mb-2 text-sm">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <label className="block mb-2 text-sm">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded mb-4"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-[#0045ff] text-white px-8 py-3 rounded mx-auto block "
            >
              {loading ? "Creating..." : "Create an account"}
            </button>
          </form>
        </div>

        {/* Signup image fixed at bottom */}
        <img
          src={SignupImage}
          alt="Sign up illustration"
          className="absolute bottom-0 left-0 w-40 md:w-36 object-contain pointer-events-none"
        />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/60">
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-12 h-12 rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600 animate-spin"
                aria-hidden="true"
              />
              <div className="text-sm font-medium text-gray-700">
                Creating account — sending confirmation email...
              </div>
            </div>
          </div>
        )}

        {/* Success overlay */}
        {success && (
          <div className="absolute inset-0 z-40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-72 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Account created</h4>
              <p className="text-sm text-gray-600 mb-4">A confirmation email has been sent. Redirecting...</p>
              <div className="flex justify-center">
                <button
                  onClick={finishSuccess}
                  className="bg-[#0045ff] text-white px-4 py-2 rounded"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
