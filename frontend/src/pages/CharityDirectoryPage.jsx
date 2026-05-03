import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
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
    <div className="min-h-screen bg-[#F5F3F0]">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <SectionTitle
          title="Charity Directory"
          subtitle="Discover impact-driven organizations supported by subscribers."
        />

        <div className="mb-6 max-w-md">
          <Input
            label="Search charities"
            placeholder="Search by name or mission"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? <Loader text="Loading charities..." /> : null}
        {error ? (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {/* Featured charity */}
        {featured ? (
          <section className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#A68A64]">
              Featured
            </p>
            <div className="rounded-xl border border-[#E5E1DC] bg-white p-6 shadow-sm transition-all duration-200 hover:border-[#A68A64] hover:shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-[#1F1F1F]">{featured.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
                    {featured.description || "No description available."}
                  </p>
                  <p className="mt-3 text-xs font-medium text-[#A68A64]">
                    Contribution: {featured.contributionPercentage ?? 10}%
                  </p>
                </div>
                <div className="shrink-0">
                  <Link
                    to={`/charities/${featured.id}`}
                    className="btn-primary inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-300"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Charity grid */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((charity) => (
            <div
              key={charity.id}
              className="group flex flex-col rounded-xl border border-[#E5E1DC] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#A68A64] hover:shadow-md"
            >
              <h3 className="text-base font-semibold text-[#1F1F1F]">{charity.name}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[#6B6B6B]">
                {charity.description || "No description available."}
              </p>
              <p className="mt-3 text-xs font-medium text-[#A68A64]">
                Contribution: {charity.contributionPercentage ?? 10}%
              </p>
              <div className="mt-4 border-t border-[#E5E1DC] pt-4">
                <Link
                  to={`/charities/${charity.id}`}
                  className="text-sm font-semibold text-[#3A2E2A] transition-colors duration-200 hover:text-[#7A2E4D]"
                >
                  Open Profile →
                </Link>
              </div>
            </div>
          ))}

          {!loading && filtered.length === 0 ? (
            <p className="col-span-full text-sm text-[#6B6B6B]">
              No charities match your search.
            </p>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default CharityDirectoryPage;
