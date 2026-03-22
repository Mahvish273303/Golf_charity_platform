const User = require("../models/User");
const Charity = require("../models/Charity");
const Score = require("../models/Score");
const Draw = require("../models/Draw");
const Result = require("../models/Result");
const Subscription = require("../models/Subscription");
const WinnerVerification = require("../models/WinnerVerification");

function toUser(user) {
  return {
    id: String(user._id),
    fullName: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    charityId: user.charityId ? String(user.charityId) : null,
    contributionPercentage: user.contributionPercentage ?? 10,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function toCharity(charity) {
  return {
    id: String(charity._id),
    name: charity.name,
    description: charity.description,
    image: charity.image,
    contributionPercentage: charity.contributionPercentage,
    createdAt: charity.createdAt,
    updatedAt: charity.updatedAt,
  };
}

function toSubscription(subscription) {
  return {
    id: String(subscription._id),
    userId: String(subscription.userId),
    charityId: subscription.charityId ? String(subscription.charityId) : null,
    plan: subscription.plan,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    isActive: subscription.isActive,
    contributionAmount: subscription.contributionAmount,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
  };
}

function toResult(result) {
  return {
    id: String(result._id),
    drawId: String(result.drawId),
    userId: String(result.userId),
    charityId: result.charityId ? String(result.charityId) : null,
    scoreId: result.scoreId ? String(result.scoreId) : null,
    matchedCount: result.matchedCount,
    matchTier: result.matchTier,
    isWinner: result.isWinner,
    prizeAmount: result.prizeAmount,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

function toDraw(draw) {
  return {
    id: String(draw._id),
    numbers: draw.numbers || [],
    monthKey: draw.monthKey,
    isPublished: draw.isPublished,
    totalPool: draw.totalPool,
    jackpotRollover: draw.jackpotRollover,
    createdById: draw.createdById ? String(draw.createdById) : null,
    publishedAt: draw.publishedAt || null,
    createdAt: draw.createdAt,
    updatedAt: draw.updatedAt,
  };
}

function toVerification(v) {
  return {
    id: String(v._id),
    resultId: String(v.resultId),
    drawId: String(v.drawId),
    userId: String(v.userId),
    proofImage: v.proofImage,
    status: v.status,
    paymentStatus: v.paymentStatus,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  };
}

async function getAllUsers(_req, res) {
  try {
    const data = await User.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json(data.map(toUser));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users." });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { fullName, role, isActive, charityId } = req.body;
    const updateData = {};
    if (fullName !== undefined) updateData.name = fullName;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (charityId !== undefined) updateData.charityId = charityId;
    const data = await User.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!data) return res.status(404).json({ message: "User not found." });
    return res.status(200).json(toUser(data));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user." });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user." });
  }
}

async function updateScore(req, res) {
  try {
    const { id } = req.params;
    const { value, playedAt } = req.body;

    if (!Number.isInteger(value) || value < 1 || value > 45) {
      return res.status(400).json({ message: "Score value must be an integer between 1 and 45." });
    }

    const data = await Score.findByIdAndUpdate(
      id,
      { value, ...(playedAt ? { playedAt: new Date(playedAt) } : {}) },
      { new: true }
    ).lean();
    if (!data) return res.status(404).json({ message: "Score not found." });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update score." });
  }
}

async function adminCreateCharity(req, res) {
  try {
    const { name, description, image, contributionPercentage = 10 } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "name is required." });
    }

    const data = await Charity.create({
      name: name.trim(),
      description: description || "",
      image: image || "",
      contributionPercentage: Math.max(0, Math.min(100, Number(contributionPercentage) || 10)),
    });
    return res.status(201).json(toCharity(data));
  } catch (error) {
    return res.status(500).json({ message: "Failed to add charity." });
  }
}

async function adminUpdateCharity(req, res) {
  try {
    const { id } = req.params;
    const { name, description, image, contributionPercentage } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (contributionPercentage !== undefined) {
      updateData.contributionPercentage = Math.max(
        0,
        Math.min(100, Number(contributionPercentage))
      );
    }
    const data = await Charity.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!data) return res.status(404).json({ message: "Charity not found." });
    return res.status(200).json(toCharity(data));
  } catch (error) {
    return res.status(500).json({ message: "Failed to edit charity." });
  }
}

async function adminDeleteCharity(req, res) {
  try {
    const { id } = req.params;
    await Charity.findByIdAndDelete(id);

    return res.status(200).json({ message: "Charity deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete charity." });
  }
}

async function getDrawResults(_req, res) {
  try {
    const latestPublished = await Draw.findOne({ isPublished: true })
      .sort({ publishedAt: -1 })
      .lean();

    if (!latestPublished) return res.status(404).json({ message: "No published draw found." });

    const results = await Result.find({ drawId: latestPublished._id })
      .sort({ matchedCount: -1 })
      .lean();

    return res.status(200).json({
      draw: toDraw(latestPublished),
      results: results.map(toResult),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch draw results." });
  }
}

async function getReports(_req, res) {
  try {
    const [totalUsers, drawsRes, subsRes] = await Promise.all([
      User.countDocuments(),
      Draw.find({ isPublished: true }).select("totalPool").lean(),
      Subscription.find().select("contributionAmount").lean(),
    ]);
    const totalPrizePool = drawsRes.reduce(
      (sum, d) => sum + Number(d.totalPool || 0),
      0
    );
    const totalDonations = subsRes.reduce(
      (sum, s) => sum + Number(s.contributionAmount || 0),
      0
    );

    return res.status(200).json({
      totalUsers,
      totalPrizePool: Number(totalPrizePool.toFixed(2)),
      totalDonations: Number(totalDonations.toFixed(2)),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load reports." });
  }
}

async function getSubscriptions(_req, res) {
  try {
    const data = await Subscription.find().sort({ createdAt: -1 }).lean();
    const userIds = [...new Set(data.map((s) => String(s.userId)))];
    const charityIds = [...new Set(data.map((s) => (s.charityId ? String(s.charityId) : null)).filter(Boolean))];
    const [usersRes, charitiesRes] = await Promise.all([
      User.find({ _id: { $in: userIds } }).select("name email").lean(),
      Charity.find({ _id: { $in: charityIds } }).select("name").lean(),
    ]);
    const userMap = new Map(
      usersRes.map((u) => [String(u._id), { id: String(u._id), fullName: u.name, email: u.email }])
    );
    const charityMap = new Map(
      charitiesRes.map((c) => [String(c._id), { id: String(c._id), name: c.name }])
    );
    const enriched = data.map((s) => ({
      ...toSubscription(s),
      user: userMap.get(String(s.userId)) || null,
      charity: s.charityId ? charityMap.get(String(s.charityId)) || null : null,
    }));

    return res.status(200).json(enriched);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch subscriptions." });
  }
}

async function updateSubscription(req, res) {
  try {
    const { id } = req.params;
    const { isActive, endDate, plan } = req.body;
    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (endDate) updateData.endDate = new Date(endDate);
    if (plan) updateData.plan = plan;
    const data = await Subscription.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!data) return res.status(404).json({ message: "Subscription not found." });
    return res.status(200).json(toSubscription(data));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update subscription." });
  }
}

async function getVerifications(req, res) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(String(status).toUpperCase())) {
      filter.status = String(status).toUpperCase();
    }
    const verifs = await WinnerVerification.find(filter).sort({ createdAt: -1 }).lean();
    if (!verifs.length) return res.status(200).json([]);
    const userIds = [...new Set(verifs.map((v) => String(v.userId)))];
    const resultIds = [...new Set(verifs.map((v) => String(v.resultId)))];
    const [usersRes, resultsRes] = await Promise.all([
      User.find({ _id: { $in: userIds } }).select("name email").lean(),
      Result.find({ _id: { $in: resultIds } }).select("matchTier prizeAmount").lean(),
    ]);
    const userMap = new Map(
      usersRes.map((u) => [String(u._id), { id: String(u._id), fullName: u.name, email: u.email }])
    );
    const resultMap = new Map(
      resultsRes.map((r) => [String(r._id), { matchTier: r.matchTier, prizeAmount: r.prizeAmount }])
    );
    return res.status(200).json(
      verifs.map((v) => ({
        ...toVerification(v),
        user: userMap.get(String(v.userId)) || null,
        result: resultMap.get(String(v.resultId)) || null,
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch verifications." });
  }
}

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
  updateScore,
  adminCreateCharity,
  adminUpdateCharity,
  adminDeleteCharity,
  getDrawResults,
  getReports,
  getSubscriptions,
  updateSubscription,
  getVerifications,
};
