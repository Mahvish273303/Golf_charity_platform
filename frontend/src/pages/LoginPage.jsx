import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
      <Navbar />
      <main className="relative z-10 mx-auto flex w-full max-w-md px-4 py-12">
        <Card className="w-full border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-purple-200/50 md:p-10">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-lg text-white shadow-md">
              ↩
            </div>
            <h1 className="text-2xl font-bold tracking-wide text-slate-900">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to manage your golf and charity journey.</p>
          </div>
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
              className="border-gray-200 bg-white/80 shadow-sm placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-purple-400"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              className="border-gray-200 bg-white/80 shadow-sm placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-purple-400"
              required
            />
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button type="submit" className="w-full" loading={loading}>
              Login
            </Button>
            <div className="mt-4 border-t border-slate-200/80 pt-4 text-center text-sm text-slate-500">
              New here?{" "}
              <Link className="font-semibold text-indigo-600 transition hover:text-indigo-500 hover:underline" to="/signup">
                Create account
              </Link>
            </div>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default LoginPage;
