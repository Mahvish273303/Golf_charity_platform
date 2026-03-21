import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Card from "../components/Card";
import Footer from "../components/Footer";
import { dashboardService } from "../services/dashboardService";

function LandingPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await dashboardService.getPublicOverview();
        setOverview(data);
      } catch {
        setOverview(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 p-6 text-white md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
          <p className="mb-2 text-sm font-medium text-indigo-100">Golf Charity Subscription Platform</p>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            Play smarter.
            <br />
            Win monthly.
            <br />
            Fund real impact.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-indigo-50 md:text-base">
            A clean, modern experience for score tracking, draw rewards, and meaningful charity
            contributions.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/signup">
              <Button variant="light" className="px-5 py-2.5">
                Subscribe Now
              </Button>
            </Link>
            <Link to="/charities">
              <Button className="px-5 py-2.5">Explore Charities</Button>
            </Link>
            <Link to="/login">
              <Button variant="soft" className="px-5 py-2.5">
                Login
              </Button>
            </Link>
          </div>
          <div className="mt-6 grid gap-2 text-xs text-indigo-50 sm:grid-cols-3">
            <p className="rounded-lg bg-white/10 px-3 py-2">
              Active Subscribers: {overview?.stats?.activeSubscriptions ?? 0}
            </p>
            <p className="rounded-lg bg-white/10 px-3 py-2">
              Total Donations: {overview?.stats?.totalDonations ?? 0}
            </p>
            <p className="rounded-lg bg-white/10 px-3 py-2">
              Latest Draw Numbers: {overview?.latestDraw?.numbers?.join(", ") || "Not published yet"}
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Card title="1. Join" className="bg-gradient-to-br from-white to-indigo-50/70">
            <p className="text-sm text-slate-600">Create your account and choose a charity at signup.</p>
          </Card>
          <Card title="2. Play" className="bg-gradient-to-br from-white to-sky-50/70">
            <p className="text-sm text-slate-600">
              Enter Stableford scores. The system auto-maintains your latest five.
            </p>
          </Card>
          <Card title="3. Win" className="bg-gradient-to-br from-white to-violet-50/70">
            <p className="text-sm text-slate-600">
              Monthly draw tiers reward 3, 4, and 5 matches with jackpot rollover support.
            </p>
          </Card>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <Card title="How It Works">
            <p className="text-sm text-slate-600">
              Subscribe monthly or yearly, enter your latest scores, and track draw results in your
              dashboard with real-time status.
            </p>
          </Card>
          <Card title="Charity Impact Spotlight">
            <p className="text-sm text-slate-600">
              A minimum percentage from subscriptions supports selected causes, with transparent impact
              reporting in admin analytics.
            </p>
          </Card>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Live Charity Highlights</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading live platform data...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(overview?.charities?.length ? overview.charities : [
                {
                  id: "placeholder-1",
                  name: "Community Youth Golf Fund",
                  description: "Support junior training and equipment access.",
                  contributionPercentage: 10,
                },
                {
                  id: "placeholder-2",
                  name: "Clean Greens Initiative",
                  description: "Drive sustainability and green course programs.",
                  contributionPercentage: 12,
                },
                {
                  id: "placeholder-3",
                  name: "Women in Golf Network",
                  description: "Mentorship and tournaments for women players.",
                  contributionPercentage: 15,
                },
              ]).slice(0, 3).map((charity) => (
                <Card key={charity.id} title={charity.name} className="transition hover:-translate-y-0.5 hover:shadow-md">
                  <p className="line-clamp-3 text-sm text-slate-600">
                    {charity.description || "No description available."}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Contribution: {charity.contributionPercentage ?? 10}%
                  </p>
                  <div className="mt-3">
                    <Link
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                      to="/charities"
                    >
                      View all charities
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
