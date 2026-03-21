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
  const [portal, setPortal] = useState("user");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(form.email, form.password);
      const isAdmin = user?.role === "ADMIN";
      if (portal === "admin" && !isAdmin) {
        setError("This account is not an admin account.");
        return;
      }
      if (portal === "user" && isAdmin) {
        navigate("/admin");
        return;
      }
      navigate(isAdmin ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto flex w-full max-w-md px-4 py-10">
        <Card title="Login" className="w-full">
          <div className="mb-4 flex rounded-xl bg-slate-100 p-1">
            <button
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                portal === "user" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600"
              }`}
              onClick={() => setPortal("user")}
              type="button"
            >
              User Login
            </button>
            <button
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                portal === "admin" ? "bg-white text-violet-700 shadow-sm" : "text-slate-600"
              }`}
              onClick={() => setPortal("admin")}
              type="button"
            >
              Admin Login
            </button>
          </div>
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              required
            />
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button type="submit" className="w-full" loading={loading}>
              Login
            </Button>
            <p className="text-center text-sm text-slate-500">
              New here?{" "}
              <Link className="font-medium text-indigo-600 hover:underline" to="/signup">
                Create account
              </Link>
            </p>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default LoginPage;
