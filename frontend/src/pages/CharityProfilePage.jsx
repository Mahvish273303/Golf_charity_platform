import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Loader from "../components/Loader";
import SectionTitle from "../components/SectionTitle";
import Footer from "../components/Footer";
import { dashboardService } from "../services/dashboardService";

function CharityProfilePage() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const list = await dashboardService.listCharities();
        const selected = (list || []).find((item) => item.id === id);
        if (!selected) {
          setError("Charity not found.");
        } else {
          setCharity(selected);
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load charity profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <SectionTitle title="Charity Profile" subtitle="Details and impact focus" />
        {loading ? <Loader text="Loading profile..." /> : null}
        {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

        {charity ? (
          <Card title={charity.name}>
            <p className="text-sm text-slate-600">
              {charity.description || "No description provided yet."}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <p className="text-sm text-slate-600">
                Contribution Percentage: {charity.contributionPercentage ?? 10}%
              </p>
              <p className="text-sm text-slate-600">
                Upcoming Events: Charity golf day announcements coming soon.
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                to="/signup"
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Subscribe & Support
              </Link>
              <Link
                to="/charities"
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Back to directory
              </Link>
            </div>
          </Card>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

export default CharityProfilePage;
