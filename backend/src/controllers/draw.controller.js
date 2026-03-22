const Draw = require("../models/Draw");
const Result = require("../models/Result");
const User = require("../models/User");
const Score = require("../models/Score");
const Subscription = require("../models/Subscription");

function toDraw(draw) {
  if (!draw) return null;
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

function generateRandomDrawNumbers(total = 5, min = 1, max = 45) {
  const set = new Set();
  while (set.size < total) {
    set.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(set).sort((a, b) => a - b);
}

function monthKeyFromDate(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function subscriptionAmount(plan) {
  return plan === "yearly" ? 1000 : 100;
}

function tierFromMatches(matches) {
  if (matches === 5) return "JACKPOT";
  if (matches === 4) return "TIER2";
  if (matches === 3) return "TIER3";
  return "NO_WIN";
}

async function generateDraw(req, res) {
  try {
    const userId = req.user.userId;
    const monthKey = monthKeyFromDate();
    const existing = await Draw.findOne({ monthKey }).select("_id").lean();

    if (existing) {
      return res.status(409).json({ message: "Draw already generated for this month." });
    }

    const draw = await Draw.create({
      numbers: generateRandomDrawNumbers(),
      monthKey,
      isPublished: false,
      totalPool: 0,
      jackpotRollover: 0,
      createdById: userId,
    });

    return res.status(201).json(toDraw(draw));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[DRAW][GENERATE] error:", error);
    return res.status(500).json({ message: "Failed to generate draw." });
  }
}

async function getLatestDraw(_req, res) {
  try {
    const data = await Draw.findOne().sort({ createdAt: -1 }).lean();
    if (!data) return res.status(404).json({ message: "No draw found." });
    return res.status(200).json(toDraw(data));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[DRAW][LATEST] error:", error);
    return res.status(500).json({ message: "Failed to fetch latest draw." });
  }
}

async function publishDraw(_req, res) {
  try {
    const draw = await Draw.findOne({ isPublished: false }).sort({ createdAt: -1 }).lean();

    if (!draw) return res.status(404).json({ message: "No unpublished draw found." });

    // Get previous jackpot rollover
    const prevDraw = await Draw.findOne({ isPublished: true })
      .sort({ publishedAt: -1 })
      .select("jackpotRollover")
      .lean();
    const previousRollover = Number(prevDraw?.jackpotRollover ?? 0);

    // Calculate subscription pool from active subscriptions
    const activeSubs = await Subscription.find({
      isActive: true,
      endDate: { $gt: new Date() },
    })
      .select("plan")
      .lean();
    const subscriptionPool = activeSubs.reduce(
      (sum, item) => sum + subscriptionAmount(item.plan),
      0
    );

    const drawNumbers = draw.numbers;

    // Get all active users
    const activeUsers = await User.find({ isActive: true }).select("_id charityId").lean();

    if (!activeUsers || !activeUsers.length) {
      return res.status(400).json({ message: "No active users to process." });
    }

    // Fetch last 5 scores for all active users in one query
    const userIds = activeUsers.map((u) => String(u._id));
    const allScores = await Score.find({ userId: { $in: userIds } })
      .select("_id userId value playedAt")
      .sort({ playedAt: -1 })
      .lean();

    // Group scores by user (take top 5 per user)
    const scoresByUser = {};
    for (const score of allScores || []) {
      const key = String(score.userId);
      if (!scoresByUser[key]) scoresByUser[key] = [];
      if (scoresByUser[key].length < 5) {
        scoresByUser[key].push(score);
      }
    }

    // Compute prize tiers
    const resultRows = activeUsers.map((user) => {
      const userIdKey = String(user._id);
      const scores = scoresByUser[userIdKey] || [];
      const matchedScores = scores.filter((s) => drawNumbers.includes(s.value));
      const matchedCount = matchedScores.length;
      const matchTier = tierFromMatches(matchedCount);
      return {
        userId: user._id,
        charityId: user.charityId || null,
        scoreId: matchedScores[0]?._id || null,
        matchedCount,
        matchTier,
        isWinner: matchedCount >= 3,
      };
    });

    const jackpotWinners = resultRows.filter((r) => r.matchTier === "JACKPOT");
    const tier2Winners = resultRows.filter((r) => r.matchTier === "TIER2");
    const tier3Winners = resultRows.filter((r) => r.matchTier === "TIER3");

    const jackpotPool = subscriptionPool * 0.4 + previousRollover;
    const tier2Pool = subscriptionPool * 0.35;
    const tier3Pool = subscriptionPool * 0.25;

    const jackpotShare = jackpotWinners.length
      ? Number((jackpotPool / jackpotWinners.length).toFixed(2))
      : 0;
    const tier2Share = tier2Winners.length
      ? Number((tier2Pool / tier2Winners.length).toFixed(2))
      : 0;
    const tier3Share = tier3Winners.length
      ? Number((tier3Pool / tier3Winners.length).toFixed(2))
      : 0;

    const rowsToInsert = resultRows.map((row) => {
      let prizeAmount = 0;
      if (row.matchTier === "JACKPOT") prizeAmount = jackpotShare;
      if (row.matchTier === "TIER2") prizeAmount = tier2Share;
      if (row.matchTier === "TIER3") prizeAmount = tier3Share;
      return { drawId: draw._id, ...row, prizeAmount };
    });
    await Result.deleteMany({ drawId: draw._id });
    await Result.insertMany(rowsToInsert);
    await Draw.findByIdAndUpdate(draw._id, {
      isPublished: true,
      publishedAt: new Date(),
      totalPool: Number(subscriptionPool.toFixed(2)),
      jackpotRollover: jackpotWinners.length ? 0 : Number(jackpotPool.toFixed(2)),
    });

    return res.status(200).json({
      message: "Draw published successfully.",
      drawId: String(draw._id),
      totalPool: Number(subscriptionPool.toFixed(2)),
      rollover: jackpotWinners.length ? 0 : Number(jackpotPool.toFixed(2)),
      winners: {
        jackpot: jackpotWinners.length,
        tier2: tier2Winners.length,
        tier3: tier3Winners.length,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[DRAW][PUBLISH] error:", error);
    return res.status(500).json({ message: "Failed to publish draw." });
  }
}

async function previewDraw(_req, res) {
  try {
    const draw = await Draw.findOne({ isPublished: false })
      .sort({ createdAt: -1 })
      .select("_id numbers monthKey createdAt isPublished totalPool jackpotRollover")
      .lean();

    if (!draw) return res.status(404).json({ message: "No unpublished draw found for preview." });

    const activeUsers = await User.find({ isActive: true }).select("_id").lean();
    const userIds = activeUsers.map((u) => u._id);
    const allScores = await Score.find({ userId: { $in: userIds } })
      .select("userId value playedAt")
      .sort({ playedAt: -1 })
      .lean();

    const scoresByUser = {};
    for (const score of allScores || []) {
      const key = String(score.userId);
      if (!scoresByUser[key]) scoresByUser[key] = [];
      if (scoresByUser[key].length < 5) {
        scoresByUser[key].push(score);
      }
    }

    const preview = activeUsers.map((user) => {
      const key = String(user._id);
      const scores = scoresByUser[key] || [];
      const values = scores.map((s) => s.value);
      const matched = draw.numbers.filter((n) => values.includes(n));
      return {
        userId: String(user._id),
        matchedCount: matched.length,
        matchTier: tierFromMatches(matched.length),
      };
    });

    return res.status(200).json({ draw: toDraw(draw), preview });
  } catch (error) {
    return res.status(500).json({ message: "Failed to preview draw." });
  }
}

async function simulateMonthlyDraw(req, res) {
  try {
    const monthKey = monthKeyFromDate();
    const existing = await Draw.findOne({ monthKey }).lean();

    if (existing?.isPublished) {
      return res.status(409).json({ message: "Monthly draw already simulated for this month." });
    }

    let draw = existing;
    if (!draw) {
      draw = await Draw.create({
        numbers: generateRandomDrawNumbers(),
        monthKey,
        isPublished: false,
        totalPool: 0,
        jackpotRollover: 0,
        createdById: req.user.userId,
      });
    }

    return res.status(200).json({
      message: "Monthly draw simulation is ready. Review preview and publish manually.",
      draw: toDraw(draw),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[DRAW][SIMULATE] error:", error);
    return res.status(500).json({ message: "Failed to run monthly draw simulation." });
  }
}

async function getUserWinnings(req, res) {
  try {
    const rows = await Result.find({ userId: req.user.userId }).sort({ createdAt: -1 }).lean();
    const drawIds = [...new Set(rows.map((r) => String(r.drawId)))];
    const draws = await Draw.find({ _id: { $in: drawIds } }).lean();
    const drawMap = new Map(draws.map((d) => [String(d._id), toDraw(d)]));
    const items = rows.map((row) => ({
      ...toResult(row),
      draw: drawMap.get(String(row.drawId)) || null,
      verification: null,
    }));

    const totalWon = items.reduce((sum, r) => sum + Number(r.prizeAmount || 0), 0);

    return res.status(200).json({
      totalWon: Number(totalWon.toFixed(2)),
      items,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch winnings overview." });
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
    // eslint-disable-next-line no-console
    console.error("[DRAW][RESULTS] error:", error);
    return res.status(500).json({ message: "Failed to fetch draw results." });
  }
}

async function getUserResult(req, res) {
  try {
    const latestDraw = await Draw.findOne({ isPublished: true }).sort({ publishedAt: -1 }).lean();

    if (!latestDraw) return res.status(404).json({ message: "No published draw found." });

    const result = await Result.findOne({
      drawId: latestDraw._id,
      userId: req.user.userId,
    }).lean();

    const tier = result?.matchTier;
    const matchType =
      tier === "JACKPOT" ? "jackpot" : tier === "TIER2" ? "tier 2" : tier === "TIER3" ? "tier 3" : "no win";

    return res.status(200).json({
      matchedCount: result?.matchedCount ?? 0,
      matchType,
      prizeAmount: Number(result?.prizeAmount ?? 0),
      draw: toDraw(latestDraw),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[DRAW][USER_RESULT] error:", error);
    return res.status(500).json({ message: "Failed to compute result." });
  }
}

module.exports = {
  generateDraw,
  previewDraw,
  publishDraw,
  simulateMonthlyDraw,
  getLatestDraw,
  getDrawResults,
  getUserResult,
  getUserWinnings,
};
