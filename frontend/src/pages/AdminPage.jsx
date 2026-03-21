import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Loader from "../components/Loader";
import SectionTitle from "../components/SectionTitle";
import Footer from "../components/Footer";
import { adminService, dashboardService } from "../services/dashboardService";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState(null);
  const [drawResults, setDrawResults] = useState(null);
  const [drawPreview, setDrawPreview] = useState(null);
  const [charities, setCharities] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [charityForm, setCharityForm] = useState({ name: "", description: "", image: "" });
  const [winnerVerificationId, setWinnerVerificationId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAdmin = async () => {
    setLoading(true);
    setError("");
    try {
      const [userData, reportData, resultsData, charityData, subscriptionsData, verificationsData] =
        await Promise.all([
        adminService.listUsers().catch(() => []),
        adminService.getReports().catch(() => null),
        adminService.getDrawResults().catch(() => null),
        dashboardService.listCharities().catch(() => []),
        adminService.getSubscriptions().catch(() => []),
        adminService.getVerifications("PENDING").catch(() => []),
      ]);
      const previewData = await adminService.previewDraw().catch(() => null);
      setUsers(Array.isArray(userData) ? userData : []);
      setReports(reportData);
      setDrawResults(resultsData);
      setDrawPreview(previewData);
      setCharities(Array.isArray(charityData) ? charityData : []);
      setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
      setVerifications(Array.isArray(verificationsData) ? verificationsData : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const runSimulate = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await adminService.simulateMonthlyDraw();
      setSuccess("Monthly simulation completed");
      await loadAdmin();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to run simulation");
    } finally {
      setSaving(false);
    }
  };

  const updateUserRole = async (id, role) => {
    setSaving(true);
    setError("");
    try {
      await adminService.updateUser(id, { role });
      await loadAdmin();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user role");
    } finally {
      setSaving(false);
    }
  };

  const toggleUserStatus = async (id, isActive) => {
    setSaving(true);
    setError("");
    try {
      await adminService.updateUser(id, { isActive: !isActive });
      await loadAdmin();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user status");
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (id) => {
    setSaving(true);
    setError("");
    try {
      await adminService.deleteUser(id);
      await loadAdmin();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  const saveCharityPercent = async (id, value) => {
    setSaving(true);
    setError("");
    try {
      await adminService.updateCharity(id, { contributionPercentage: Number(value) });
      await loadAdmin();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update charity");
    } finally {
      setSaving(false);
    }
  };

  const removeCharity = async (id) => {
    setSaving(true);
    setError("");
    try {
      await adminService.deleteCharity(id);
      await loadAdmin();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete charity");
    } finally {
      setSaving(false);
    }
  };

  const changeWinnerState = async (type, overrideId) => {
    const verificationId = overrideId || winnerVerificationId;
    if (!verificationId) return;
    setSaving(true);
    setError("");
    try {
      if (type === "approve") await adminService.approveWinner(verificationId);
      if (type === "reject") await adminService.rejectWinner(verificationId);
      if (type === "paid") await adminService.markWinnerPaid(verificationId);
      setSuccess("Winner status updated");
      setWinnerVerificationId("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update winner status");
    } finally {
      setSaving(false);
    }
  };

  const updateSubscriptionStatus = async (id, isActive) => {
    setSaving(true);
    setError("");
    try {
      await adminService.updateSubscription(id, { isActive: !isActive });
      await loadAdmin();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update subscription");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, []);

  const runGenerate = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await adminService.generateDraw();
      setSuccess("Draw generated");
      await loadAdmin();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to generate draw");
    } finally {
      setSaving(false);
    }
  };

  const runPublish = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await adminService.publishDraw();
      setSuccess("Draw published");
      await loadAdmin();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to publish draw");
    } finally {
      setSaving(false);
    }
  };

  const createCharity = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await adminService.createCharity(charityForm);
      setSuccess("Charity created");
      setCharityForm({ name: "", description: "", image: "" });
      await loadAdmin();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create charity");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <SectionTitle title="Admin Dashboard" subtitle="Manage users, draws, charities, and reports." />
        {loading ? <Loader text="Loading admin dashboard..." /> : null}
        {error ? <p className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
        {success ? <p className="mb-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p> : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Reports">
            <p className="text-sm text-slate-600">Total Users: {reports?.totalUsers ?? 0}</p>
            <p className="text-sm text-slate-600">Total Prize Pool: {reports?.totalPrizePool ?? 0}</p>
            <p className="text-sm text-slate-600">Total Donations: {reports?.totalDonations ?? 0}</p>
          </Card>

          <Card title="Draw Management">
            <div className="flex flex-wrap gap-2">
              <Button onClick={runGenerate} loading={saving}>
                Generate Draw
              </Button>
              <Button className="bg-violet-600 hover:bg-violet-500" onClick={runSimulate} loading={saving}>
                Simulate Monthly
              </Button>
              <Button className="bg-sky-600 hover:bg-sky-500" onClick={runPublish} loading={saving}>
                Publish Draw
              </Button>
            </div>
          </Card>

          <Card title="Draw Preview">
            {!drawPreview?.draw ? (
              <p className="text-sm text-slate-500">No unpublished draw preview available.</p>
            ) : (
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  Draw: {drawPreview.draw.monthKey || "N/A"} | Numbers:{" "}
                  {drawPreview.draw.numbers?.join(", ")}
                </p>
                <p>Preview Participants: {drawPreview.preview?.length || 0}</p>
              </div>
            )}
          </Card>

          <Card title="Charity Management">
            <form className="space-y-2" onSubmit={createCharity}>
              <Input
                label="Name"
                value={charityForm.name}
                onChange={(e) => setCharityForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <Input
                label="Description"
                value={charityForm.description}
                onChange={(e) => setCharityForm((p) => ({ ...p, description: e.target.value }))}
              />
              <Input
                label="Image URL"
                value={charityForm.image}
                onChange={(e) => setCharityForm((p) => ({ ...p, image: e.target.value }))}
              />
              <Button type="submit" loading={saving}>
                Add Charity
              </Button>
            </form>
          </Card>

          <Card title="Latest Draw Results">
            {!drawResults?.results?.length ? (
              <p className="text-sm text-slate-500">No results yet.</p>
            ) : (
              <ul className="space-y-2">
                {drawResults.results.slice(0, 8).map((result) => (
                  <li key={result.id} className="rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
                    User: {result.userId} | Tier: {result.matchTier} | Prize: {result.prizeAmount}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Charity Listing Management" className="mt-4">
          <div className="grid gap-2">
            {charities.map((charity) => (
              <div
                key={charity.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{charity.name}</p>
                  <p className="text-xs text-slate-500">{charity.description || "No description"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={charity.contributionPercentage ?? 10}
                    onBlur={(e) => saveCharityPercent(charity.id, e.target.value)}
                    className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                  />
                  <Button className="bg-rose-600 hover:bg-rose-500" onClick={() => removeCharity(charity.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Winner Verification Controls" className="mt-4">
          <p className="mb-2 text-sm text-slate-600">
            Use winner verification ID from backend logs/admin responses to approve, reject, or mark paid.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              label="Verification ID"
              value={winnerVerificationId}
              onChange={(e) => setWinnerVerificationId(e.target.value)}
              className="sm:min-w-[280px]"
            />
            <div className="flex flex-wrap items-end gap-2">
              <Button onClick={() => changeWinnerState("approve")} loading={saving}>
                Approve
              </Button>
              <Button className="bg-amber-600 hover:bg-amber-500" onClick={() => changeWinnerState("reject")} loading={saving}>
                Reject
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => changeWinnerState("paid")} loading={saving}>
                Mark Paid
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Pending Winner Verifications" className="mt-4">
          {!verifications.length ? (
            <p className="text-sm text-slate-500">No pending verification requests.</p>
          ) : (
            <div className="space-y-2">
              {verifications.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-xs text-slate-700">
                    <p className="font-semibold">{item.user?.fullName || item.userId}</p>
                    <p>Tier: {item.result?.matchTier} | Prize: {item.result?.prizeAmount}</p>
                    <p>Status: {item.status} | Payment: {item.paymentStatus}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="px-2 py-1 text-xs"
                      onClick={() => changeWinnerState("approve", item.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="soft"
                      className="px-2 py-1 text-xs"
                      onClick={() => changeWinnerState("reject", item.id)}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="dark"
                      className="px-2 py-1 text-xs"
                      onClick={() => changeWinnerState("paid", item.id)}
                    >
                      Mark Paid
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Subscription Management" className="mt-4">
          <div className="space-y-2">
            {subscriptions.slice(0, 12).map((sub) => (
              <div
                key={sub.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="text-xs text-slate-700">
                  <p className="font-semibold">{sub.user?.fullName || sub.userId}</p>
                  <p>
                    Plan: {sub.plan} | End: {new Date(sub.endDate).toLocaleDateString()} | Active:{" "}
                    {String(sub.isActive)}
                  </p>
                </div>
                <Button
                  className="px-2 py-1 text-xs"
                  onClick={() => updateSubscriptionStatus(sub.id, sub.isActive)}
                >
                  {sub.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            ))}
            {!subscriptions.length ? (
              <p className="text-sm text-slate-500">No subscriptions found.</p>
            ) : null}
          </div>
        </Card>

        <Card title="Users" className="mt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{user.fullName}</td>
                    <td className="py-2 pr-3">{user.email}</td>
                    <td className="py-2 pr-3">
                      <select
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="py-2">{user.isActive ? "Active" : "Inactive"}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button
                          className="bg-slate-700 px-2 py-1 text-xs hover:bg-slate-600"
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          className="bg-rose-600 px-2 py-1 text-xs hover:bg-rose-500"
                          onClick={() => removeUser(user.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default AdminPage;
