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
      setError(err?.response?.data?.message || "Signup failed");
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
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Select Charity (optional)</span>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                value={form.charityId}
                onChange={(e) => setForm((p) => ({ ...p, charityId: e.target.value }))}
              >
                <option value="">Choose later</option>
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </label>
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
