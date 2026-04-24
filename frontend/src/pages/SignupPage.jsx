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

  const normalizeCharityList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.charities)) return payload.charities;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  useEffect(() => {
    dashboardService
      .listCharities()
      .then((data) => setCharities(normalizeCharityList(data)))
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
      <Navbar />
      <main className="relative z-10 mx-auto flex w-full max-w-md px-4 py-12">
        <Card className="w-full border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-purple-200/50 md:p-10">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-lg text-white shadow-md">
              ✨
            </div>
            <h1 className="text-2xl font-bold tracking-wide text-slate-900">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">Join the platform and start supporting your chosen charity.</p>
          </div>
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Your full name"
              className="border-gray-200 bg-white/80 shadow-sm placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-purple-400"
              required
            />
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
              placeholder="Minimum 6 characters"
              className="border-gray-200 bg-white/80 shadow-sm placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-purple-400"
              required
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Choose Charity (optional)</p>
              <div className="grid gap-2">
                {charities && charities.length > 0 ? (
                  charities.map((charity) => {
                    const charityId = charity.id || charity._id || charity.charityId;
                    const active = form.charityId === charityId;
                  return (
                    <button
                      key={charityId}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          charityId: active ? "" : charityId,
                        }))
                      }
                      className={`rounded-xl border border-gray-200 bg-white/60 p-3 text-left backdrop-blur-md transition-all duration-300 ${
                        active
                          ? "border-purple-500 bg-purple-50/50 shadow-md"
                          : "hover:-translate-y-0.5 hover:border-purple-400 hover:shadow-md"
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
                  })
                ) : (
                  <p className="text-xs text-slate-500">No charities available right now.</p>
                )}
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
              className="border-gray-200 bg-white/80 shadow-sm placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-purple-400"
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
            <div className="mt-4 border-t border-slate-200/80 pt-4 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link className="font-semibold text-indigo-600 transition hover:text-indigo-500 hover:underline" to="/login">
                Login
              </Link>
            </div>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default SignupPage;
