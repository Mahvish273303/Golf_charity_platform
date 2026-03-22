const Score = require("../models/Score");

function toScore(score) {
  return {
    id: String(score._id),
    userId: String(score.userId),
    value: score.value,
    playedAt: score.playedAt,
    createdAt: score.createdAt,
    updatedAt: score.updatedAt,
  };
}

async function addScore(req, res) {
  try {
    const { value, playedAt } = req.body;
    const userId = req.user.userId;

    if (!Number.isInteger(value) || value < 1 || value > 45) {
      return res.status(400).json({ message: "Score value must be an integer between 1 and 45." });
    }

    const created = await Score.create({
      userId,
      value,
      playedAt: playedAt ? new Date(playedAt) : new Date(),
    });

    // Enforce last-5 logic: delete oldest scores beyond 5
    const allScores = await Score.find({ userId })
      .sort({ playedAt: -1 })
      .select("_id")
      .lean();
    if (allScores.length > 5) {
      const idsToDelete = allScores.slice(5).map((s) => s._id);
      await Score.deleteMany({ _id: { $in: idsToDelete } });
    }

    return res.status(201).json(toScore(created));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[SCORE][ADD] error:", error);
    return res.status(500).json({ message: "Failed to add score." });
  }
}

async function getScores(req, res) {
  try {
    const data = await Score.find({ userId: req.user.userId }).sort({ playedAt: -1 }).lean();
    return res.status(200).json(data.map(toScore));
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

    const existing = await Score.findById(id).lean();
    if (!existing || String(existing.userId) !== String(userId)) {
      return res.status(404).json({ message: "Score not found." });
    }

    const updated = await Score.findByIdAndUpdate(
      id,
      {
        value,
        ...(playedAt ? { playedAt: new Date(playedAt) } : {}),
      },
      { new: true }
    ).lean();

    return res.status(200).json(toScore(updated));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update score." });
  }
}

module.exports = { addScore, getScores, updateScore };
