import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
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
      if (msg.toLowerCase().includes("check your email") || msg.toLowerCase().includes("confirm")) {
        setSuccess(msg);
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F3F0]">
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#A68A64]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-24 h-80 w-80 rounded-full bg-[#3A2E2A]/10 blur-3xl" />
      <Navbar />
      <main className="relative z-10 mx-auto flex w-full max-w-md px-4 py-12">
        <div className="w-full rounded-xl border border-[#E5E1DC] bg-white/95 p-8 shadow-lg backdrop-blur-sm md:p-10">

          {/* Header */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#3A2E2A] text-base text-white shadow-sm">
              ✨
            </div>
            <h1 className="text-2xl font-semibold text-[#1F1F1F]">Create your account</h1>
            <p className="mt-1.5 text-sm text-[#6B6B6B]">Join the platform and start supporting your chosen charity.</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Your full name"
              className="bg-white/90"
              required
            />
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
              placeholder="Minimum 6 characters"
              className="bg-white/90"
              required
            />

            {/* Charity selector */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#1F1F1F]">Choose Charity <span className="font-normal text-[#6B6B6B]">(optional)</span></p>
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
                          setForm((p) => ({ ...p, charityId: active ? "" : charityId }))
                        }
                        className={`rounded-lg border p-3 text-left transition-colors duration-200 ${
                          active
                            ? "border-[#A68A64] bg-[#F5F3F0]"
                            : "border-[#E5E1DC] bg-white hover:border-[#A68A64] hover:bg-[#F5F3F0]"
                        }`}
                      >
                        <p className="text-sm font-semibold text-[#1F1F1F]">{charity.name}</p>
                        <p className="mt-0.5 text-xs text-[#6B6B6B]">
                          {charity.description || "Charity partner"}
                        </p>
                        <p className="mt-1.5 text-xs font-medium text-[#A68A64]">
                          Contribution: {charity.contributionPercentage ?? 10}%
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#6B6B6B]">No charities available right now.</p>
                )}
              </div>
            </div>

            <Input
              label="Contribution Percentage (min 10)"
              type="number"
              min={10}
              max={100}
              value={form.contributionPercentage}
              onChange={(e) => setForm((p) => ({ ...p, contributionPercentage: e.target.value }))}
              className="bg-white/90"
            />

            {error ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#3A2E2A] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#4A3A34] hover:shadow-md hover:shadow-black/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Create Account"}
            </button>

            <div className="border-t border-[#E5E1DC] pt-4 text-center text-sm text-[#6B6B6B]">
              Already have an account?{" "}
              <Link className="font-semibold text-[#3A2E2A] transition-colors duration-200 hover:text-[#A68A64]" to="/login">
                Login
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default SignupPage;
