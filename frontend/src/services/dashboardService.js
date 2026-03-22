import api from "./api";

export const dashboardService = {
  getPublicOverview: () => api.get("/api/public/overview").then((r) => r.data),
  addScore: (value, playedAt) => api.post("/api/score", { value, playedAt }).then((r) => r.data),
  updateScore: (id, value, playedAt) =>
    api.patch(`/api/score/${id}`, { value, playedAt }).then((r) => r.data),
  getScores: () => api.get("/api/score").then((r) => r.data),
  getLatestDraw: () => api.get("/api/draw/latest").then((r) => r.data),
  getDrawResult: () => api.get("/api/draw/result").then((r) => r.data),
  getWinnings: () => api.get("/api/draw/winnings").then((r) => r.data),
  listCharities: (params = {}) => api.get("/api/charity", { params }).then((r) => r.data),
  myCharity: () => api.get("/api/charity/me").then((r) => r.data),
  selectCharity: (charityId, contributionPercentage) =>
    api
      .patch("/api/users/select-charity", { charityId, contributionPercentage })
      .then((r) => r.data),
  updateMyContribution: (contributionPercentage) =>
    api.patch("/api/charity/me/contribution", { contributionPercentage }).then((r) => r.data),
  subscribe: (plan) =>
    api.post("/api/subscription/subscribe", { plan }).then((r) => r.data),
  getSubscriptionStatus: () => api.get("/api/subscription/status").then((r) => r.data),
  cancelSubscription: () => api.post("/api/subscription/cancel").then((r) => r.data),
  uploadWinnerProof: (drawId, proofImage) =>
    api.post("/api/winner/proof", { drawId, proofImage }).then((r) => r.data),
};

export const adminService = {
  listUsers: () => api.get("/api/admin/users").then((r) => r.data),
  updateUser: (id, payload) => api.patch(`/api/admin/users/${id}`, payload).then((r) => r.data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`).then((r) => r.data),
  updateScore: (id, payload) => api.patch(`/api/admin/scores/${id}`, payload).then((r) => r.data),
  generateDraw: () => api.post("/api/admin/draw/generate").then((r) => r.data),
  simulateMonthlyDraw: () => api.post("/api/admin/draw/simulate-monthly").then((r) => r.data),
  previewDraw: () => api.get("/api/admin/draw/preview").then((r) => r.data),
  publishDraw: () => api.post("/api/admin/draw/publish").then((r) => r.data),
  getDrawResults: () => api.get("/api/admin/draw/results").then((r) => r.data),
  getSubscriptions: () => api.get("/api/admin/subscriptions").then((r) => r.data),
  updateSubscription: (id, payload) =>
    api.patch(`/api/admin/subscriptions/${id}`, payload).then((r) => r.data),
  getVerifications: (status = "PENDING") =>
    api.get("/api/admin/verifications", { params: { status } }).then((r) => r.data),
  getReports: () => api.get("/api/admin/reports").then((r) => r.data),
  createCharity: (payload) => api.post("/api/admin/charity", payload).then((r) => r.data),
  updateCharity: (id, payload) => api.patch(`/api/admin/charity/${id}`, payload).then((r) => r.data),
  deleteCharity: (id) => api.delete(`/api/admin/charity/${id}`).then((r) => r.data),
  approveWinner: (id) => api.patch(`/api/winner/${id}/approve`).then((r) => r.data),
  rejectWinner: (id) => api.patch(`/api/winner/${id}/reject`).then((r) => r.data),
  markWinnerPaid: (id) => api.patch(`/api/winner/${id}/paid`).then((r) => r.data),
};
