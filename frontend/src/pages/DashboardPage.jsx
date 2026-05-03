import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Loader from "../components/Loader";
import SectionTitle from "../components/SectionTitle";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { dashboardService } from "../services/dashboardService";
import { taskService } from "../services/dashboardService";

function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scores, setScores] = useState([]);
  const [charities, setCharities] = useState([]);
  const [myCharity, setMyCharity] = useState(null);
  const [latestDraw, setLatestDraw] = useState(null);
  const [drawResult, setDrawResult] = useState(null);
  const [winnings, setWinnings] = useState({ totalWon: 0, items: [] });
  const [subscription, setSubscription] = useState(null);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, overdue: 0 });
  const [scoreInput, setScoreInput] = useState("");
  const [scoreDate, setScoreDate] = useState("");
  const [editingScoreId, setEditingScoreId] = useState("");
  const [editingScoreValue, setEditingScoreValue] = useState("");
  const [editingScoreDate, setEditingScoreDate] = useState("");
  const [selectedCharityId, setSelectedCharityId] = useState("");
  const [contributionPercentage, setContributionPercentage] = useState(10);
  const [plan, setPlan] = useState("monthly");
  const [saving, setSaving] = useState(false);
  const [proofImage, setProofImage] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        scoreData,
        charityList,
        drawData,
        resultData,
        winningsData,
        subscriptionStatus,
        myCharityData,
        taskStatsData,
      ] = await Promise.all([
        dashboardService.getScores().catch(() => []),
        dashboardService.listCharities().catch(() => []),
        dashboardService.getLatestDraw().catch(() => null),
        dashboardService.getDrawResult().catch(() => null),
        dashboardService.getWinnings().catch(() => ({ totalWon: 0, items: [] })),
        dashboardService.getSubscriptionStatus().catch(() => null),
        dashboardService.myCharity().catch(() => null),
        taskService.getTaskStats().catch(() => ({ total: 0, completed: 0, overdue: 0 })),
      ]);
      setScores(Array.isArray(scoreData) ? scoreData : []);
      setCharities(Array.isArray(charityList) ? charityList : []);
      setLatestDraw(drawData);
      setDrawResult(resultData);
      setWinnings(winningsData || { totalWon: 0, items: [] });
      setSubscription(subscriptionStatus);
      setMyCharity(myCharityData);
      setTaskStats(taskStatsData || { total: 0, completed: 0, overdue: 0 });
      if (myCharityData?.id) {
        setSelectedCharityId(myCharityData.id);
      }
      setContributionPercentage(myCharityData?.contributionPercentage ?? 10);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const addScore = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await dashboardService.addScore(Number(scoreInput), scoreDate || undefined);
      setScoreInput("");
      setScoreDate("");
      await loadDashboard();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add score");
    } finally {
      setSaving(false);
    }
  };

  const updateCharity = async (charityId = selectedCharityId) => {
    if (!charityId) return;
    setSaving(true);
    setError("");
    try {
      setSelectedCharityId(charityId);
      await dashboardService.selectCharity(charityId, Number(contributionPercentage));
      await loadDashboard();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to select charity");
    } finally {
      setSaving(false);
    }
  };

  const updateContribution = async () => {
    setSaving(true);
    setError("");
    try {
      await dashboardService.updateMyContribution(Number(contributionPercentage));
      await loadDashboard();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update contribution percentage");
    } finally {
      setSaving(false);
    }
  };

  const startEditScore = (score) => {
    setEditingScoreId(score.id);
    setEditingScoreValue(String(score.value));
    setEditingScoreDate(new Date(score.playedAt || score.createdAt).toISOString().split("T")[0]);
  };

  const saveEditScore = async () => {
    setSaving(true);
    setError("");
    try {
      await dashboardService.updateScore(
        editingScoreId,
        Number(editingScoreValue),
        editingScoreDate || undefined
      );
      setEditingScoreId("");
      setEditingScoreValue("");
      setEditingScoreDate("");
      await loadDashboard();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update score");
    } finally {
      setSaving(false);
    }
  };

  const subscribe = async () => {
    setSaving(true);
    setError("");
    try {
      await dashboardService.subscribe(plan);
      await loadDashboard();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to subscribe");
    } finally {
      setSaving(false);
    }
  };

  const cancel = async () => {
    setSaving(true);
    setError("");
    try {
      await dashboardService.cancelSubscription();
      await loadDashboard();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel subscription");
    } finally {
      setSaving(false);
    }
  };

  const uploadProof = async () => {
    if (!latestDraw?.id || !proofImage) return;
    setSaving(true);
    setError("");
    try {
      await dashboardService.uploadWinnerProof(latestDraw.id, proofImage);
      setProofImage("");
      await loadDashboard();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload proof");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3F0]">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <section className="mb-7 rounded-[2rem] border border-[#A68A64]/30 bg-gradient-to-r from-[#3A2E2A] to-[#5A463F] p-6 text-white shadow-xl shadow-[#1F1F1F]/20 md:p-8">
          <p className="text-sm text-[#A68A64]">Welcome back</p>
          <h1 className="mt-1 text-3xl font-bold tracking-wide md:text-4xl">{user?.fullName || "Player Dashboard"}</h1>
          <p className="mt-2 text-sm text-[#E5E1DC]">
            Track scores, manage subscription, and monitor draw performance from one place.
          </p>
        </section>
        <SectionTitle title="Dashboard" subtitle="Manage your profile, scores, draw, and subscription." />
        {error ? <p className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
        {loading ? <Loader text="Loading your dashboard..." /> : null}

        <div className="mt-6 rounded-3xl bg-[#F5F3F0]/30 p-4">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card title="Profile" className="xl:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#3A2E2A] to-[#A68A64] text-lg font-bold text-white shadow-md">
                {(user?.fullName || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{user?.fullName || "User"}</p>
                <p className="text-xs text-slate-500">{user?.email || "-"}</p>
              </div>
            </div>
            <p className="text-sm text-[#6B6B6B]">Name: {user?.fullName || "-"}</p>
            <p className="text-sm text-[#6B6B6B]">Email: {user?.email || "-"}</p>
            <p className="text-sm text-[#6B6B6B]">Role: {user?.role || "USER"}</p>
            <p className="text-sm text-[#6B6B6B]">Selected Charity: {myCharity?.name || "None selected"}</p>
            <p className="text-sm text-[#6B6B6B]">
              Contribution %: {myCharity?.contributionPercentage ?? user?.contributionPercentage ?? 10}
            </p>
            <p className="text-sm text-[#6B6B6B]">
              Subscription: {subscription?.active ? "Active" : "Inactive"}
            </p>
          </Card>

          <Card title="Subscription" className="xl:col-span-1">
            <div className="space-y-3">
              <p className="text-sm text-[#6B6B6B]">
                Status: <span className="font-semibold text-[#1F1F1F]">{subscription?.active ? "Active" : "Inactive"}</span>
              </p>
              <p className="text-sm text-[#6B6B6B]">
                Expiry: {subscription?.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString() : "-"}
              </p>
              <div className="flex gap-2">
                <select
                  className="rounded-lg border border-[#E5E1DC] bg-white px-3 py-2 text-sm shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#A68A64]"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                >
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                </select>
                <Button
                  onClick={subscribe}
                  loading={saving}
                  disabled={Boolean(subscription?.active)}
                  className={subscription?.active ? "bg-emerald-500/90 hover:bg-emerald-600" : ""}
                >
                  {subscription?.active ? "Subscribed" : "Subscribe"}
                </Button>
                <Button variant="dark" onClick={cancel} loading={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Participation Summary" className="xl:col-span-1">
            <p className="text-sm text-[#6B6B6B]">
              Draws Entered: {subscription?.active && latestDraw ? 1 : 0}
            </p>
            <p className="text-sm text-[#6B6B6B]">
              Upcoming Draw: {subscription?.active ? "You are eligible this month" : "Activate subscription"}
            </p>
            <p className="text-sm text-[#6B6B6B]">
              Winnings (latest): {drawResult?.prizeAmount ?? 0}
            </p>
          </Card>

          <Card title="Task Overview" className="xl:col-span-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-[#F5F3F0] px-3 py-2">
                <span className="text-sm text-[#6B6B6B]">Total Tasks</span>
                <span className="text-lg font-bold text-[#1F1F1F]">{taskStats.total}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2">
                <span className="text-sm text-emerald-700">Completed</span>
                <span className="text-lg font-bold text-emerald-700">{taskStats.completed}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2">
                <span className="text-sm text-rose-700">Overdue</span>
                <span className="text-lg font-bold text-rose-700">{taskStats.overdue}</span>
              </div>
              <a
                href="/tasks"
                className="btn-primary mt-1 block rounded-xl px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-90"
              >
                View All Tasks →
              </a>
            </div>
          </Card>

          <Card title="Scores" className="xl:col-span-2">
            <form className="space-y-3" onSubmit={addScore}>
              <Input
                label="Add score (1-45)"
                type="number"
                min={1}
                max={45}
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                required
              />
              <Input
                label="Played Date (optional)"
                type="date"
                value={scoreDate}
                onChange={(e) => setScoreDate(e.target.value)}
              />
              <Button type="submit" loading={saving}>
                Add Score
              </Button>
            </form>
            <ul className="mt-4 space-y-2">
              {scores.slice(0, 5).map((score) => (
                <li key={score.id} className="rounded-xl border border-[#E5E1DC] bg-[#F5F3F0] px-3 py-2 text-sm text-[#1F1F1F] shadow-sm transition-all duration-300 hover:bg-[#F5F3F0] hover:shadow-md">
                  {editingScoreId === score.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          className="w-20 rounded-lg border border-[#E5E1DC] bg-white px-2 py-1 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#A68A64]"
                          type="number"
                          min={1}
                          max={45}
                          value={editingScoreValue}
                          onChange={(e) => setEditingScoreValue(e.target.value)}
                        />
                        <input
                          className="rounded-lg border border-[#E5E1DC] bg-white px-2 py-1 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#A68A64]"
                          type="date"
                          value={editingScoreDate}
                          onChange={(e) => setEditingScoreDate(e.target.value)}
                        />
                        <Button className="px-2 py-1 text-xs" onClick={saveEditScore} loading={saving}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span>
                        {score.value} -{" "}
                        {new Date(score.playedAt || score.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        variant="soft"
                        className="px-2 py-1 text-xs"
                        onClick={() => startEditScore(score)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </li>
              ))}
              {!scores.length ? <li className="text-sm text-slate-500">No scores yet.</li> : null}
            </ul>
          </Card>

          <Card title="Charity" className="xl:col-span-2">
            <p className="mb-3 text-sm text-[#6B6B6B]">Selected: {myCharity?.name || "None selected"}</p>
            <p className="mb-3 text-sm text-[#6B6B6B]">
              Contribution Percentage: {myCharity?.contributionPercentage ?? 10}%
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {charities.map((charity) => {
                const active = selectedCharityId === charity.id;
                return (
                  <button
                    key={charity.id}
                    type="button"
                    onClick={() => setSelectedCharityId(charity.id)}
                    className={`rounded-2xl border p-4 text-left transition-all duration-300 ${
                      active
                        ? "border-[#A68A64] bg-[#F5F3F0] shadow-lg"
                        : "border-[#E5E1DC] bg-white hover:-translate-y-1 hover:border-[#A68A64] hover:shadow-lg"
                    }`}
                  >
                    <p className="font-semibold text-[#1F1F1F]">{charity.name}</p>
                    <p className="mt-1 text-xs text-[#6B6B6B]">
                      {charity.description || "Charity partner"}
                    </p>
                    <p className="mt-2 text-xs font-medium text-[#3A2E2A]">
                      {charity.contributionPercentage}% default contribution
                    </p>
                    <div className="mt-3">
                      <Button
                        className="px-2 py-1 text-xs"
                        variant={active ? "soft" : "primary"}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCharity(charity.id);
                        }}
                        loading={saving && selectedCharityId === charity.id}
                      >
                        Choose
                      </Button>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                label="Your Contribution % (min 10)"
                type="number"
                min={10}
                max={100}
                value={contributionPercentage}
                onChange={(e) => setContributionPercentage(e.target.value)}
              />
              <Button onClick={updateContribution} loading={saving}>
                Update %
              </Button>
            </div>
          </Card>

          <Card title="Latest Draw">
            <p className="text-sm text-[#6B6B6B]">
              Numbers: {Array.isArray(latestDraw?.numbers) ? latestDraw.numbers.join(", ") : "No draw yet"}
            </p>
          </Card>

          <Card title="Your Result">
            <p className="text-sm text-[#6B6B6B]">Match Type: {drawResult?.matchType || "N/A"}</p>
            <p className="text-sm text-[#6B6B6B]">Matched Count: {drawResult?.matchedCount ?? 0}</p>
            <p className="text-sm text-[#6B6B6B]">Prize: {drawResult?.prizeAmount ?? 0}</p>
          </Card>

          <Card title="Winner Verification">
            <p className="mb-2 text-sm text-[#6B6B6B]">
              If you are a winner, upload proof for verification and payout processing.
            </p>
            <div className="space-y-2">
              <Input
                label="Proof Image URL"
                value={proofImage}
                onChange={(e) => setProofImage(e.target.value)}
                placeholder="https://..."
              />
              <Button onClick={uploadProof} loading={saving}>
                Upload Proof
              </Button>
            </div>
          </Card>

          <Card title="Independent Donation">
            <p className="text-sm text-[#6B6B6B]">
              Independent donation mode is prepared in UI and can be connected to a payment flow.
            </p>
          </Card>

          <Card title="Winnings Overview" className="md:col-span-2 xl:col-span-3">
            <p className="mb-2 text-sm text-[#1F1F1F]">Total Won: {winnings?.totalWon ?? 0}</p>
            <div className="space-y-2">
              {(winnings?.items || []).slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E5E1DC] bg-[#F5F3F0] px-3 py-2 text-sm text-[#1F1F1F] shadow-sm transition-all duration-300 hover:bg-[#F5F3F0] hover:shadow-md"
                >
                  <span>
                    {item.draw?.monthKey || "N/A"} - {item.matchTier}
                  </span>
                  <span>Prize: {item.prizeAmount}</span>
                  <span>
                    Payment: {item.verification?.paymentStatus || "PENDING"} / Verify:{" "}
                    {item.verification?.status || "PENDING"}
                  </span>
                </div>
              ))}
              {!winnings?.items?.length ? (
                <p className="text-sm text-slate-500">No winnings history yet.</p>
              ) : null}
            </div>
          </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default DashboardPage;
