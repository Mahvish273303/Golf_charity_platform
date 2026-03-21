const { prisma } = require("../config/db");

async function addScore(req, res) {
  try {
    const { value, playedAt } = req.body;
    const userId = req.user.userId;

    if (!Number.isInteger(value) || value < 1 || value > 45) {
      return res.status(400).json({ message: "Score value must be an integer between 1 and 45." });
    }

    const createdScore = await prisma.score.create({
      data: {
        userId,
        value,
        ...(playedAt ? { playedAt: new Date(playedAt) } : {}),
      },
    });

    const userScores = await prisma.score.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
      select: { id: true },
    });

    if (userScores.length > 5) {
      const idsToDelete = userScores.slice(5).map((score) => score.id);
      await prisma.score.deleteMany({
        where: {
          id: { in: idsToDelete },
          userId,
        },
      });
    }

    return res.status(201).json(createdScore);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[SCORE][ADD] error:", error);
    return res.status(500).json({ message: "Failed to add score." });
  }
}

async function getScores(req, res) {
  try {
    const userId = req.user.userId;
    const scores = await prisma.score.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
    });

    return res.status(200).json(scores);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[SCORE][GET] error:", error);
    return res.status(500).json({ message: "Failed to fetch scores." });
  }
}

async function updateScore(req, res) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { value, playedAt } = req.body;

    if (!Number.isInteger(value) || value < 1 || value > 45) {
      return res.status(400).json({ message: "Score value must be an integer between 1 and 45." });
    }

    const score = await prisma.score.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!score || score.userId !== userId) {
      return res.status(404).json({ message: "Score not found." });
    }

    const updated = await prisma.score.update({
      where: { id },
      data: {
        value,
        ...(playedAt ? { playedAt: new Date(playedAt) } : {}),
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update score." });
  }
}

module.exports = {
  addScore,
  getScores,
  updateScore,
};
