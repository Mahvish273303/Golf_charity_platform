const { prisma } = require("../config/db");

function generateRandomDrawNumbers(total = 5, min = 1, max = 45) {
  const set = new Set();
  while (set.size < total) {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    set.add(value);
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
    const numbers = generateRandomDrawNumbers();

    const existingForMonth = await prisma.draw.findUnique({
      where: { monthKey },
      select: { id: true },
    });

    if (existingForMonth) {
      return res.status(409).json({ message: "Draw already generated for this month." });
    }

    const draw = await prisma.draw.create({
      data: {
        numbers,
        monthKey,
        createdById: userId,
      },
    });

    return res.status(201).json(draw);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[DRAW][GENERATE] error:", error);
    return res.status(500).json({ message: "Failed to generate draw." });
  }
}

async function getLatestDraw(_req, res) {
  try {
    const latestDraw = await prisma.draw.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!latestDraw) {
      return res.status(404).json({ message: "No draw found." });
    }

    return res.status(200).json(latestDraw);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[DRAW][LATEST] error:", error);
    return res.status(500).json({ message: "Failed to fetch latest draw." });
  }
}

async function publishDraw(_req, res) {
  try {
    const draw = await prisma.draw.findFirst({
      where: { isPublished: false },
      orderBy: { createdAt: "desc" },
    });

    if (!draw) {
      return res.status(404).json({ message: "No unpublished draw found." });
    }

    const previousDraw = await prisma.draw.findFirst({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      select: { jackpotRollover: true },
    });
    const previousRollover = Number(previousDraw?.jackpotRollover ?? 0);

    const activeSubscriptions = await prisma.subscription.findMany({
      where: { isActive: true, endDate: { gt: new Date() } },
      select: { plan: true },
    });
    const subscriptionPool = activeSubscriptions.reduce(
      (sum, item) => sum + subscriptionAmount(item.plan),
      0
    );

    const drawNumbers = draw.numbers;
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        charityId: true,
        scores: {
          orderBy: { playedAt: "desc" },
          take: 5,
          select: { id: true, value: true },
        },
      },
    });

    const resultRows = users.map((user) => {
      const matchedScores = user.scores.filter((s) => drawNumbers.includes(s.value));
      const matchedCount = matchedScores.length;
      const matchTier = tierFromMatches(matchedCount);
      return {
        drawId: draw.id,
        userId: user.id,
        charityId: user.charityId,
        scoreId: matchedScores[0]?.id,
        matchedCount,
        matchTier,
        isWinner: matchedCount >= 3,
      };
    });

    const jackpotWinners = resultRows.filter((row) => row.matchTier === "JACKPOT");
    const tier2Winners = resultRows.filter((row) => row.matchTier === "TIER2");
    const tier3Winners = resultRows.filter((row) => row.matchTier === "TIER3");

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

    const rowsToCreate = resultRows.map((row) => {
      let prizeAmount = 0;
      if (row.matchTier === "JACKPOT") prizeAmount = jackpotShare;
      if (row.matchTier === "TIER2") prizeAmount = tier2Share;
      if (row.matchTier === "TIER3") prizeAmount = tier3Share;
      return {
        ...row,
        prizeAmount,
      };
    });

    await prisma.$transaction([
      prisma.result.deleteMany({ where: { drawId: draw.id } }),
      prisma.result.createMany({ data: rowsToCreate }),
      prisma.draw.update({
        where: { id: draw.id },
        data: {
          isPublished: true,
          publishedAt: new Date(),
          totalPool: Number(subscriptionPool.toFixed(2)),
          jackpotRollover: jackpotWinners.length ? 0 : Number(jackpotPool.toFixed(2)),
        },
      }),
    ]);

    return res.status(200).json({
      message: "Draw published successfully.",
      drawId: draw.id,
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
    const draw = await prisma.draw.findFirst({
      where: { isPublished: false },
      orderBy: { createdAt: "desc" },
      select: { id: true, numbers: true, monthKey: true, createdAt: true },
    });

    if (!draw) {
      return res.status(404).json({ message: "No unpublished draw found for preview." });
    }

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        scores: {
          orderBy: { playedAt: "desc" },
          take: 5,
          select: { value: true },
        },
      },
    });

    const preview = users.map((user) => {
      const values = user.scores.map((score) => score.value);
      const matched = draw.numbers.filter((n) => values.includes(n));
      return {
        userId: user.id,
        matchedCount: matched.length,
        matchTier: tierFromMatches(matched.length),
      };
    });

    return res.status(200).json({
      draw,
      preview,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to preview draw." });
  }
}

async function simulateMonthlyDraw(req, res) {
  try {
    const monthKey = monthKeyFromDate();
    const existing = await prisma.draw.findUnique({ where: { monthKey } });

    if (existing?.isPublished) {
      return res.status(409).json({ message: "Monthly draw already simulated for this month." });
    }

    let draw = existing;
    if (!draw) {
      const numbers = generateRandomDrawNumbers();
      draw = await prisma.draw.create({
        data: {
          numbers,
          monthKey,
          createdById: req.user.userId,
        },
      });
    }
    return res.status(200).json({
      message: "Monthly draw simulation is ready. Review preview and publish manually.",
      draw,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[DRAW][SIMULATE] error:", error);
    return res.status(500).json({ message: "Failed to run monthly draw simulation." });
  }
}

async function getUserWinnings(req, res) {
  try {
    const rows = await prisma.result.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        matchTier: true,
        prizeAmount: true,
        createdAt: true,
        draw: {
          select: {
            id: true,
            monthKey: true,
            numbers: true,
            isPublished: true,
          },
        },
        verification: {
          select: {
            status: true,
            paymentStatus: true,
          },
        },
      },
    });

    const totalWon = rows.reduce((sum, row) => sum + Number(row.prizeAmount || 0), 0);
    return res.status(200).json({
      totalWon: Number(totalWon.toFixed(2)),
      items: rows,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch winnings overview." });
  }
}

async function getDrawResults(_req, res) {
  try {
    const latestPublished = await prisma.draw.findFirst({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    });

    if (!latestPublished) {
      return res.status(404).json({ message: "No published draw found." });
    }

    const results = await prisma.result.findMany({
      where: { drawId: latestPublished.id },
      orderBy: [{ matchedCount: "desc" }, { prizeAmount: "desc" }],
    });

    return res.status(200).json({
      draw: latestPublished,
      results,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[DRAW][RESULTS] error:", error);
    return res.status(500).json({ message: "Failed to fetch draw results." });
  }
}

async function getUserResult(req, res) {
  try {
    const latestDraw = await prisma.draw.findFirst({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    });

    if (!latestDraw) {
      return res.status(404).json({ message: "No published draw found." });
    }

    const result = await prisma.result.findUnique({
      where: {
        drawId_userId: {
          drawId: latestDraw.id,
          userId: req.user.userId,
        },
      },
      select: {
        matchedCount: true,
        matchTier: true,
        prizeAmount: true,
      },
    });

    return res.status(200).json({
      matchedCount: result?.matchedCount ?? 0,
      matchType:
        result?.matchTier === "JACKPOT"
          ? "jackpot"
          : result?.matchTier === "TIER2"
            ? "tier 2"
            : result?.matchTier === "TIER3"
              ? "tier 3"
              : "no win",
      prizeAmount: Number(result?.prizeAmount ?? 0),
      draw: latestDraw,
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
