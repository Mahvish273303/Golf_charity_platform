import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Loader from "../components/Loader";
import Input from "../components/Input";
import SectionTitle from "../components/SectionTitle";
import Footer from "../components/Footer";
import { dashboardService } from "../services/dashboardService";

function CharityDirectoryPage() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await dashboardService.listCharities();
        setCharities(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load charities");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return charities;
    return charities.filter((c) => {
      return (
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    });
  }, [charities, search]);

  const featured = filtered[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <SectionTitle
          title="Charity Directory"
          subtitle="Discover impact-driven organizations supported by subscribers."
        />
        <Input
          label="Search charities"
          placeholder="Search by name or mission"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading ? <Loader text="Loading charities..." /> : null}
        {error ? <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

        {featured ? (
          <section className="mt-6">
            <Card title="Featured Charity" className="border-indigo-200 bg-indigo-50/60">
              <h3 className="text-xl font-bold text-slate-900">{featured.name}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {featured.description || "No description available."}
              </p>
              <div className="mt-4">
                <Link
                  to={`/charities/${featured.id}`}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  View profile
                </Link>
              </div>
            </Card>
          </section>
        ) : null}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((charity) => (
            <Card key={charity.id} title={charity.name} className="transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="line-clamp-3 text-sm text-slate-600">
                {charity.description || "No description available."}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Contribution: {charity.contributionPercentage ?? 10}%
              </p>
              <div className="mt-3">
                <Link
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                  to={`/charities/${charity.id}`}
                >
                  Open Profile
                </Link>
              </div>
            </Card>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default CharityDirectoryPage;
