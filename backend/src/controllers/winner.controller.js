const WinnerVerification = require("../models/WinnerVerification");
const Result = require("../models/Result");
const User = require("../models/User");
const Draw = require("../models/Draw");

function toDraw(draw) {
  return {
    id: String(draw._id),
    numbers: draw.numbers || [],
    monthKey: draw.monthKey,
    isPublished: draw.isPublished,
    totalPool: draw.totalPool || 0,
    jackpotRollover: draw.jackpotRollover || 0,
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

async function listVerifications(req, res) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(String(status).toUpperCase())) {
      filter.status = String(status).toUpperCase();
    }
    const verifs = await WinnerVerification.find(filter).sort({ createdAt: -1 }).lean();
    if (!verifs.length) return res.status(200).json([]);

    // Enrich with user, draw, and result info
    const userIds = [...new Set(verifs.map((v) => String(v.userId)))];
    const drawIds = [...new Set(verifs.map((v) => String(v.drawId)))];
    const resultIds = [...new Set(verifs.map((v) => String(v.resultId)))];

    const [usersRes, drawsRes, resultsRes] = await Promise.all([
      User.find({ _id: { $in: userIds } }).select("name email").lean(),
      Draw.find({ _id: { $in: drawIds } }).lean(),
      Result.find({ _id: { $in: resultIds } }).select("prizeAmount matchTier").lean(),
    ]);

    const userMap = new Map(
      usersRes.map((u) => [String(u._id), { id: String(u._id), fullName: u.name, email: u.email }])
    );
    const drawMap = new Map((drawsRes || []).map((d) => [String(d._id), toDraw(d)]));
    const resultMap = new Map(
      (resultsRes || []).map((r) => [
        String(r._id),
        { prizeAmount: r.prizeAmount, matchTier: r.matchTier },
      ])
    );

    const enriched = verifs.map((v) => ({
      ...toVerification(v),
      user: userMap.get(String(v.userId)) || null,
      draw: drawMap.get(String(v.drawId)) || null,
      result: resultMap.get(String(v.resultId)) || null,
    }));

    return res.status(200).json(enriched);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch winner verifications." });
  }
}

async function uploadProof(req, res) {
  try {
    const { drawId, proofImage } = req.body;
    const userId = req.user.userId;

    if (!drawId || !proofImage) {
      return res.status(400).json({ message: "drawId and proofImage are required." });
    }

    const result = await Result.findOne({ drawId, userId }).select("_id isWinner").lean();

    if (!result || !result.isWinner) {
      return res.status(400).json({ message: "No winning result found for this draw." });
    }
    const verification = await WinnerVerification.findOneAndUpdate(
      { resultId: result._id },
      {
        resultId: result._id,
        drawId,
        userId,
        proofImage,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(201).json(toVerification(verification));
  } catch (error) {
    return res.status(500).json({ message: "Failed to upload proof." });
  }
}

async function approveWinner(req, res) {
  try {
    const { id } = req.params;
    const data = await WinnerVerification.findByIdAndUpdate(
      id,
      { status: "APPROVED" },
      { new: true }
    ).lean();
    if (!data) return res.status(404).json({ message: "Verification not found." });

    return res.status(200).json(toVerification(data));
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve winner." });
  }
}

async function rejectWinner(req, res) {
  try {
    const { id } = req.params;
    const data = await WinnerVerification.findByIdAndUpdate(
      id,
      { status: "REJECTED" },
      { new: true }
    ).lean();
    if (!data) return res.status(404).json({ message: "Verification not found." });

    return res.status(200).json(toVerification(data));
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject winner." });
  }
}

async function markWinnerPaid(req, res) {
  try {
    const { id } = req.params;
    const data = await WinnerVerification.findByIdAndUpdate(
      id,
      { paymentStatus: "PAID" },
      { new: true }
    ).lean();
    if (!data) return res.status(404).json({ message: "Verification not found." });

    return res.status(200).json(toVerification(data));
  } catch (error) {
    return res.status(500).json({ message: "Failed to mark winner as paid." });
  }
}

module.exports = { listVerifications, uploadProof, approveWinner, rejectWinner, markWinnerPaid };
