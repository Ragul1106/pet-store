// src/pages/Login.jsx
import React, { useState } from "react";
import api from "../lib/api";
import { useNavigate, useLocation } from "react-router-dom";
import RegisterModal from "../components/RegisterModal";

export default function Login() {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginChange = (e) =>
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/token/", {
        email: loginForm.email,
        password: loginForm.password,
      });

      // ✅ Save tokens & set axios header
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;

      // ✅ Fetch user and store
      const meRes = await api.get("/account/me/");
      localStorage.setItem("user", JSON.stringify(meRes.data));

      // ✅ Notify navbar
      window.dispatchEvent(new Event("authChanged"));

      // ✅ If we were redirected here, go back to original page
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        (err.response?.data &&
          typeof err.response.data === "object" &&
          Object.values(err.response.data)[0]?.[0]) ||
        "Invalid email or password";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto py-8 ">
      <h1 className="text-2xl font-bold mb-6 px-6">Account</h1>

      <div className="overflow-hidden">
        {/* Header strip */}
        <div className="bg-[#98FB98] text-center py-3 grid grid-cols-2 border-b">
          <div className="font-semibold">Returning customer</div>
          <div className="font-semibold">New customer</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 relative">
          {/* Left: Login form */}
          <div>
            <form onSubmit={handleLogin}>
              <label className="block text-sm mb-1">Email <span className="text-red-600">*</span></label>
              <input
                name="email"
                type="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                required
                className="w-full lg:w-96 border border-gray-500 rounded px-3 py-2 mb-4"
                autoComplete="email"
              />

              <label className="block text-sm mb-1">Password <span className="text-red-600">*</span></label>
              <input
                name="password"
                type="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
                className="w-full lg:w-96 border border-gray-500 rounded px-3 py-2 mb-4"
                autoComplete="current-password"
              />

              {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
              <br />
              <button
                type="submit"
                className="bg-[#0045ff] text-white px-6 py-2 rounded disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="mt-3 text-sm text-gray-600 cursor-pointer">
              Forgot your password?
            </div>
          </div>

          {/* Right: Register CTA */}
          <div className="flex flex-col items-start md:pl-8 lg:pr-64">
            <p>Register with us for a faster checkout, to track the status of your order and more.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 bg-[#0045ff] text-white px-6 py-2 rounded"
            >
              Create an account
            </button>
          </div>

          {/* Vertical separator with OR for large screens */}
          <div className="hidden md:flex absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 items-center">
            <div className="h-full border-l-2 border-gray-400"></div>
            <span className="absolute bg-white px-2 font-semibold -left-[16px] text-black">or</span>
          </div>
        </div>

        <div className="border-t border-gray-400"></div>
      </div>

      {/* Pass the original `from` location into the RegisterModal so it can redirect back */}
      <RegisterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        redirectTo={location.state?.from || null}
      />
    </div>
  );
}
