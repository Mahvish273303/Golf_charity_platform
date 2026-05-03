import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Footer from "../components/Footer";

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await login(form.email, form.password);
      if (response?.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("[LoginPage] error:", err);
      setError(err?.message || err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F3F0]">
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#A68A64]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-24 h-80 w-80 rounded-full bg-[#3A2E2A]/10 blur-3xl" />
      <Navbar />
      <main className="relative z-10 mx-auto flex w-full max-w-md px-4 py-14">
        <div className="w-full rounded-xl border border-[#E5E1DC] bg-white/95 p-8 shadow-lg backdrop-blur-sm md:p-10">

          {/* Header */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#3A2E2A] text-base text-white shadow-sm">
              ↩
            </div>
            <h1 className="text-2xl font-semibold text-[#1F1F1F]">Welcome back</h1>
            <p className="mt-1.5 text-sm text-[#6B6B6B]">Sign in to manage your golf and charity journey.</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
              className="bg-white/90"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              className="bg-white/90"
              required
            />

            {error ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#3A2E2A] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#4A3A34] hover:shadow-md hover:shadow-black/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Login"}
            </button>

            <div className="border-t border-[#E5E1DC] pt-4 text-center text-sm text-[#6B6B6B]">
              New here?{" "}
              <Link className="font-semibold text-[#3A2E2A] transition-colors duration-200 hover:text-[#A68A64]" to="/signup">
                Create account
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default LoginPage;
