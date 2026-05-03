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
    <div className="min-h-screen bg-[#F5F3F0]">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#3A2E2A] to-[#5A463F] p-8 text-white shadow-2xl shadow-[#3A2E2A]/25 md:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#A68A64]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-10 h-80 w-80 rounded-full bg-[#A68A64]/8 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#A68A64]">
                Golf Charity Subscription Platform
              </p>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Play smarter.
                <br />
                Win monthly.
                <br />
                Fund real impact.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-gray-300 md:text-base">
                A premium experience for score tracking, monthly draw rewards, and meaningful charity
                contributions — all in one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup">
                  <Button className="px-6 py-2.5 text-sm">Subscribe Now</Button>
                </Link>
                <Link to="/charities">
                  <Button variant="light" className="px-6 py-2.5 text-sm">
                    Explore Charities
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="soft" className="px-6 py-2.5 text-sm">
                    Login
                  </Button>
                </Link>
              </div>
            </div>

            {/* Live snapshot panel */}
            <div>
              <div className="rounded-xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#A68A64]">
                  Live Platform Snapshot
                </p>
                <div className="grid gap-3">
                  {[
                    { label: "Active Subscribers", value: overview?.stats?.activeSubscriptions ?? 0 },
                    { label: "Total Donations",     value: overview?.stats?.totalDonations ?? 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg border border-white/10 bg-white/10 px-4 py-3">
                      <p className="text-xs text-gray-300">{label}</p>
                      <p className="mt-1 text-2xl font-bold">{value}</p>
                    </div>
                  ))}
                  <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-3">
                    <p className="text-xs text-gray-300">Latest Draw Numbers</p>
                    <p className="mt-1 text-sm font-semibold">
                      {overview?.latestDraw?.numbers?.join(", ") || "Not published yet"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ──────────────────────────────────────── */}
        <section className="mt-8 grid gap-5 sm:grid-cols-3">
          <Card>
            <div className="space-y-2">
              <p className="text-2xl">🏌️</p>
              <p className="text-sm font-semibold text-[#1F1F1F]">Active Subscribers</p>
              <p className="text-3xl font-bold text-[#3A2E2A]">{overview?.stats?.activeSubscriptions ?? 0}</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-2xl">💚</p>
              <p className="text-sm font-semibold text-[#1F1F1F]">Donation Impact</p>
              <p className="text-3xl font-bold text-[#3A2E2A]">{overview?.stats?.totalDonations ?? 0}</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-2xl">🎯</p>
              <p className="text-sm font-semibold text-[#1F1F1F]">Latest Draw</p>
              <p className="text-sm font-semibold text-[#A68A64]">
                {overview?.latestDraw?.numbers?.join(", ") || "Pending"}
              </p>
            </div>
          </Card>
        </section>

        {/* ── How It Works ─────────────────────────────────────── */}
        <section className="mt-10 rounded-2xl border border-[#E5E1DC] bg-white px-6 py-12 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#1F1F1F] md:text-3xl">How It Works</h2>
          <p className="mt-2 text-sm text-[#6B6B6B]">Three simple steps to play, contribute, and win.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { icon: "✨", step: "Step 1", title: "Join",  desc: "Create your account and optionally choose a charity to support." },
              { icon: "📈", step: "Step 2", title: "Play",  desc: "Enter Stableford scores. The system auto-maintains your latest five." },
              { icon: "🏆", step: "Step 3", title: "Win",   desc: "Monthly draw tiers reward 3, 4, and 5 matches with jackpot rollover." },
            ].map(({ icon, step, title, desc }) => (
              <Card key={step}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F3F0] text-xl">{icon}</span>
                    <span className="btn-primary rounded-full px-3 py-1 text-xs font-semibold text-white">{step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#1F1F1F]">{title}</h3>
                  <p className="text-sm leading-relaxed text-[#6B6B6B]">{desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Info cards ───────────────────────────────────────── */}
        <section className="mt-6 grid gap-5 md:grid-cols-2">
          <Card title="How It Works">
            <p className="text-sm leading-relaxed text-[#6B6B6B]">
              Subscribe monthly or yearly, enter your latest scores, and track draw results in your
              dashboard with real-time status updates.
            </p>
          </Card>
          <Card title="Charity Impact Spotlight">
            <p className="text-sm leading-relaxed text-[#6B6B6B]">
              A guaranteed percentage from every subscription supports your chosen cause, with
              transparent impact reporting available in admin analytics.
            </p>
          </Card>
        </section>

        {/* ── Charity highlights ───────────────────────────────── */}
        <section className="mt-6 rounded-2xl border border-[#E5E1DC] bg-white px-6 py-12">
          <h2 className="text-3xl font-semibold text-[#1F1F1F] md:text-4xl">
            Live Charity Highlights
          </h2>
          <p className="mt-2 mb-8 text-sm text-[#6B6B6B]">
            Choose a cause with transparent contribution percentages and real impact.
          </p>
          {loading ? (
            <p className="text-sm text-[#6B6B6B]">Loading live platform data...</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(overview?.charities?.length
                ? overview.charities
                : [
                    { id: "p1", name: "Community Youth Golf Fund",  description: "Support junior training and equipment access.",     contributionPercentage: 10 },
                    { id: "p2", name: "Clean Greens Initiative",    description: "Drive sustainability and green course programs.",    contributionPercentage: 12 },
                    { id: "p3", name: "Women in Golf Network",      description: "Mentorship and tournaments for women players.",      contributionPercentage: 15 },
                  ])
                .slice(0, 3)
                .map((charity) => (
                  <Card key={charity.id} title={charity.name}>
                    <div className="space-y-3">
                      <p className="line-clamp-3 text-sm leading-relaxed text-[#6B6B6B]">
                        {charity.description || "No description available."}
                      </p>
                      <p className="text-xs font-medium text-[#A68A64]">
                        Contribution: {charity.contributionPercentage ?? 10}%
                      </p>
                      <div className="border-t border-[#E5E1DC] pt-3">
                        <Link
                          className="text-xs font-semibold text-[#3A2E2A] transition-colors duration-200 hover:text-[#7A2E4D]"
                          to="/charities"
                        >
                          View all charities →
                        </Link>
                      </div>
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
