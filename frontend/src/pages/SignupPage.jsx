import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Footer from "../components/Footer";
import { dashboardService } from "../services/dashboardService";

function SignupPage() {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    charityId: "",
    contributionPercentage: 10,
  });
  const [charities, setCharities] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    dashboardService
      .listCharities()
      .then((data) => setCharities(Array.isArray(data) ? data : []))
      .catch(() => setCharities([]));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signup({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        charityId: form.charityId || undefined,
        contributionPercentage: Number(form.contributionPercentage || 10),
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("[SignupPage] error:", err);
      const msg = err?.message || err?.response?.data?.message || "Signup failed";
      // "check your email" means account was created but email confirmation is needed
      if (msg.toLowerCase().includes("check your email") || msg.toLowerCase().includes("confirm")) {
        setSuccess(msg);
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto flex w-full max-w-md px-4 py-10">
        <Card title="Create Account" className="w-full">
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Your full name"
              required
            />
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
              placeholder="Minimum 6 characters"
              required
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Choose Charity (optional)</p>
              <div className="grid gap-2">
                {charities.map((charity) => {
                  const active = form.charityId === charity.id;
                  return (
                    <button
                      key={charity.id}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          charityId: active ? "" : charity.id,
                        }))
                      }
                      className={`rounded-xl border p-3 text-left transition ${
                        active
                          ? "border-indigo-500 bg-indigo-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                      }`}
                    >
                      <p className="font-semibold text-slate-800">{charity.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {charity.description || "Charity partner"}
                      </p>
                      <p className="mt-2 text-xs text-indigo-700">
                        Default contribution: {charity.contributionPercentage ?? 10}%
                      </p>
                    </button>
                  );
                })}
                {!charities.length ? (
                  <p className="text-xs text-slate-500">No charities available right now.</p>
                ) : null}
              </div>
            </div>
            <Input
              label="Contribution Percentage (min 10)"
              type="number"
              min={10}
              max={100}
              value={form.contributionPercentage}
              onChange={(e) =>
                setForm((p) => ({ ...p, contributionPercentage: e.target.value }))
              }
            />
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            {success ? (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </p>
            ) : null}
            <Button type="submit" className="w-full" loading={loading}>
              Signup
            </Button>
            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link className="font-medium text-indigo-600 hover:underline" to="/login">
                Login
              </Link>
            </p>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default SignupPage;
