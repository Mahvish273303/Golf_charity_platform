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
    <div className="min-h-screen bg-[#F5F3F0]">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <SectionTitle title="Charity Profile" subtitle="Details and impact focus" />
        {loading ? <Loader text="Loading profile..." /> : null}
        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {charity ? (
          <Card title={charity.name}>
            <p className="text-sm leading-relaxed text-[#6B6B6B]">
              {charity.description || "No description provided yet."}
            </p>

            <div className="mt-5 grid gap-4 rounded-lg border border-[#E5E1DC] bg-[#F5F3F0] p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A68A64]">
                  Contribution Rate
                </p>
                <p className="mt-1 text-2xl font-bold text-[#1F1F1F]">
                  {charity.contributionPercentage ?? 10}
                  <span className="text-base font-medium text-[#6B6B6B]">%</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A68A64]">
                  Upcoming Events
                </p>
                <p className="mt-1 text-sm text-[#6B6B6B]">
                  Charity golf day announcements coming soon.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-300"
              >
                Subscribe &amp; Support
              </Link>
              <Link
                to="/charities"
                className="rounded-lg border border-[#E5E1DC] bg-white px-4 py-2 text-sm font-semibold text-[#3A2E2A] transition-colors duration-200 hover:bg-[#F3F2EF] hover:text-[#7A2E4D]"
              >
                ← Back to Directory
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
