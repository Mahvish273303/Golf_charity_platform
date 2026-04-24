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
      ] = await Promise.all([
        dashboardService.getScores().catch(() => []),
        dashboardService.listCharities().catch(() => []),
        dashboardService.getLatestDraw().catch(() => null),
        dashboardService.getDrawResult().catch(() => null),
        dashboardService.getWinnings().catch(() => ({ totalWon: 0, items: [] })),
        dashboardService.getSubscriptionStatus().catch(() => null),
        dashboardService.myCharity().catch(() => null),
      ]);
      setScores(Array.isArray(scoreData) ? scoreData : []);
      setCharities(Array.isArray(charityList) ? charityList : []);
      setLatestDraw(drawData);
      setDrawResult(resultData);
      setWinnings(winningsData || { totalWon: 0, items: [] });
      setSubscription(subscriptionStatus);
      setMyCharity(myCharityData);
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <section className="mb-7 rounded-[2rem] border border-white/60 bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 p-6 text-white shadow-xl shadow-indigo-200/50 md:p-8">
          <p className="text-sm text-indigo-100">Welcome back</p>
          <h1 className="mt-1 text-3xl font-bold tracking-wide md:text-4xl">{user?.fullName || "Player Dashboard"}</h1>
          <p className="mt-2 text-sm text-indigo-100">
            Track scores, manage subscription, and monitor draw performance from one place.
          </p>
        </section>
        <SectionTitle title="Dashboard" subtitle="Manage your profile, scores, draw, and subscription." />
        {error ? <p className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
        {loading ? <Loader text="Loading your dashboard..." /> : null}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Card title="Profile" className="bg-white/75 xl:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-lg font-bold text-white shadow-md">
                {(user?.fullName || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{user?.fullName || "User"}</p>
                <p className="text-xs text-slate-500">{user?.email || "-"}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">Name: {user?.fullName || "-"}</p>
            <p className="text-sm text-slate-600">Email: {user?.email || "-"}</p>
            <p className="text-sm text-slate-600">Role: {user?.role || "USER"}</p>
            <p className="text-sm text-slate-600">Selected Charity: {myCharity?.name || "None selected"}</p>
            <p className="text-sm text-slate-600">
              Contribution %: {myCharity?.contributionPercentage ?? user?.contributionPercentage ?? 10}
            </p>
            <p className="text-sm text-slate-600">
              Subscription: {subscription?.active ? "Active" : "Inactive"}
            </p>
          </Card>

          <Card title="Subscription" className="bg-white/75 xl:col-span-1">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Status: <span className="font-semibold">{subscription?.active ? "Active" : "Inactive"}</span>
              </p>
              <p className="text-sm text-slate-600">
                Expiry: {subscription?.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString() : "-"}
              </p>
              <div className="flex gap-2">
                <select
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
                  className={subscription?.active ? "bg-emerald-600 hover:bg-emerald-600" : ""}
                >
                  {subscription?.active ? "Subscribed" : "Subscribe"}
                </Button>
                <Button variant="dark" onClick={cancel} loading={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Participation Summary" className="bg-white/75 xl:col-span-1">
            <p className="text-sm text-slate-600">
              Draws Entered: {subscription?.active && latestDraw ? 1 : 0}
            </p>
            <p className="text-sm text-slate-600">
              Upcoming Draw: {subscription?.active ? "You are eligible this month" : "Activate subscription"}
            </p>
            <p className="text-sm text-slate-600">
              Winnings (latest): {drawResult?.prizeAmount ?? 0}
            </p>
          </Card>

          <Card title="Scores" className="bg-white/75 xl:col-span-2">
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
                <li key={score.id} className="rounded-xl bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:shadow-md">
                  {editingScoreId === score.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          className="w-20 rounded-lg border border-slate-200 px-2 py-1 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          type="number"
                          min={1}
                          max={45}
                          value={editingScoreValue}
                          onChange={(e) => setEditingScoreValue(e.target.value)}
                        />
                        <input
                          className="rounded-lg border border-slate-200 px-2 py-1 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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

          <Card title="Charity" className="bg-white/75 xl:col-span-2">
            <p className="mb-3 text-sm text-slate-600">Selected: {myCharity?.name || "None selected"}</p>
            <p className="mb-3 text-sm text-slate-600">
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
                        ? "border-indigo-500 bg-indigo-50 shadow-md"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                    }`}
                  >
                    <p className="font-semibold text-slate-800">{charity.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {charity.description || "Charity partner"}
                    </p>
                    <p className="mt-2 text-xs font-medium text-indigo-700">
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

          <Card title="Latest Draw" className="bg-white/75">
            <p className="text-sm text-slate-600">
              Numbers: {Array.isArray(latestDraw?.numbers) ? latestDraw.numbers.join(", ") : "No draw yet"}
            </p>
          </Card>

          <Card title="Your Result" className="bg-white/75">
            <p className="text-sm text-slate-600">Match Type: {drawResult?.matchType || "N/A"}</p>
            <p className="text-sm text-slate-600">Matched Count: {drawResult?.matchedCount ?? 0}</p>
            <p className="text-sm text-slate-600">Prize: {drawResult?.prizeAmount ?? 0}</p>
          </Card>

          <Card title="Winner Verification" className="bg-white/75">
            <p className="mb-2 text-sm text-slate-600">
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

          <Card title="Independent Donation" className="bg-white/75">
            <p className="text-sm text-slate-600">
              Independent donation mode is prepared in UI and can be connected to a payment flow.
            </p>
          </Card>

          <Card title="Winnings Overview" className="bg-white/75 md:col-span-2 xl:col-span-3">
            <p className="mb-2 text-sm text-slate-700">Total Won: {winnings?.totalWon ?? 0}</p>
            <div className="space-y-2">
              {(winnings?.items || []).slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:shadow-md"
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
      </main>
      <Footer />
    </div>
  );
}

export default DashboardPage;
