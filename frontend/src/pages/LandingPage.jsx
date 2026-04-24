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
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-slate-900 p-6 text-white shadow-xl shadow-slate-300/40 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-600/75 via-violet-600/60 to-sky-500/65" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-14 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold tracking-wide text-indigo-100">
                Golf Charity Subscription Platform
              </p>
              <h1 className="text-4xl font-bold leading-tight tracking-wide md:text-5xl lg:text-6xl">
                Play smarter.
                <br />
                Win monthly.
                <br />
                Fund real impact.
              </h1>
              <p className="mt-4 max-w-xl text-sm text-indigo-50 md:text-base">
                A clean, premium experience for score tracking, draw rewards, and meaningful charity
                contributions.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup">
                  <Button className="px-6 py-3">Subscribe Now</Button>
                </Link>
                <Link to="/charities">
                  <Button variant="light" className="px-6 py-3">
                    Explore Charities
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="soft" className="px-6 py-3">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-white/40 bg-white/15 p-6 backdrop-blur-md">
                <p className="text-sm font-semibold tracking-wide text-indigo-100">Live Platform Snapshot</p>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl bg-white/20 p-4 shadow-lg backdrop-blur">
                    <p className="text-xs text-indigo-100">Active Subscribers</p>
                    <p className="mt-1 text-2xl font-bold">{overview?.stats?.activeSubscriptions ?? 0}</p>
                  </div>
                  <div className="rounded-2xl bg-white/20 p-4 shadow-lg backdrop-blur">
                    <p className="text-xs text-indigo-100">Total Donations</p>
                    <p className="mt-1 text-2xl font-bold">{overview?.stats?.totalDonations ?? 0}</p>
                  </div>
                  <div className="rounded-2xl bg-white/20 p-4 shadow-lg backdrop-blur">
                    <p className="text-xs text-indigo-100">Latest Draw Numbers</p>
                    <p className="mt-1 text-sm font-semibold">
                      {overview?.latestDraw?.numbers?.join(", ") || "Not published yet"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card className="bg-white/75">
            <p className="text-2xl">🏌️</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">Active Subscribers</p>
            <p className="text-2xl font-bold text-indigo-700">{overview?.stats?.activeSubscriptions ?? 0}</p>
          </Card>
          <Card className="bg-white/75">
            <p className="text-2xl">💚</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">Donation Impact</p>
            <p className="text-2xl font-bold text-emerald-700">{overview?.stats?.totalDonations ?? 0}</p>
          </Card>
          <Card className="bg-white/75">
            <p className="text-2xl">🎯</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">Latest Draw</p>
            <p className="text-sm font-bold text-violet-700">
              {overview?.latestDraw?.numbers?.join(", ") || "Pending"}
            </p>
          </Card>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-wide text-slate-900 md:text-3xl">How It Works</h2>
          <p className="mt-2 text-sm text-slate-500">Three simple steps to play, contribute, and win.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Card title="1. Join" className="bg-white/80">
              <p className="mb-3 text-2xl">✨</p>
              <p className="text-sm text-slate-600">Create your account and optionally choose a charity.</p>
            </Card>
            <Card title="2. Play" className="bg-white/80">
              <p className="mb-3 text-2xl">📈</p>
              <p className="text-sm text-slate-600">
                Enter Stableford scores. The system auto-maintains your latest five.
              </p>
            </Card>
            <Card title="3. Win" className="bg-white/80">
              <p className="mb-3 text-2xl">🏆</p>
              <p className="text-sm text-slate-600">
                Monthly draw tiers reward 3, 4, and 5 matches with jackpot rollover support.
              </p>
            </Card>
          </div>
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

        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold tracking-wide text-slate-900">Live Charity Highlights</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading live platform data...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(overview?.charities?.length
                ? overview.charities
                : [
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
                  ])
                .slice(0, 3)
                .map((charity) => (
                  <Card key={charity.id} title={charity.name} className="bg-white/80">
                    <p className="line-clamp-3 text-sm text-slate-600">
                      {charity.description || "No description available."}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Contribution: {charity.contributionPercentage ?? 10}%
                    </p>
                    <div className="mt-3">
                      <Link
                        className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500"
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
