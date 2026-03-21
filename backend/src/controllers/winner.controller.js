const { prisma } = require("../config/db");

async function listVerifications(req, res) {
  try {
    const { status } = req.query;
    const where = {};
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(String(status).toUpperCase())) {
      where.status = String(status).toUpperCase();
    }

    const verifications = await prisma.winnerVerification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        draw: {
          select: { id: true, monthKey: true, numbers: true },
        },
        result: {
          select: { prizeAmount: true, matchTier: true },
        },
      },
    });

    return res.status(200).json(verifications);
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

    const result = await prisma.result.findUnique({
      where: {
        drawId_userId: {
          drawId,
          userId,
        },
      },
      select: { id: true, isWinner: true },
    });

    if (!result || !result.isWinner) {
      return res.status(400).json({ message: "No winning result found for this draw." });
    }

    const verification = await prisma.winnerVerification.upsert({
      where: { resultId: result.id },
      update: {
        proofImage,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
      create: {
        resultId: result.id,
        drawId,
        userId,
        proofImage,
      },
    });

    return res.status(201).json(verification);
  } catch (error) {
    return res.status(500).json({ message: "Failed to upload proof." });
  }
}

async function approveWinner(req, res) {
  try {
    const { id } = req.params;
    const verification = await prisma.winnerVerification.update({
      where: { id },
      data: { status: "APPROVED" },
    });
    return res.status(200).json(verification);
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve winner." });
  }
}

async function rejectWinner(req, res) {
  try {
    const { id } = req.params;
    const verification = await prisma.winnerVerification.update({
      where: { id },
      data: { status: "REJECTED" },
    });
    return res.status(200).json(verification);
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject winner." });
  }
}

async function markWinnerPaid(req, res) {
  try {
    const { id } = req.params;
    const verification = await prisma.winnerVerification.update({
      where: { id },
      data: { paymentStatus: "PAID" },
    });
    return res.status(200).json(verification);
  } catch (error) {
    return res.status(500).json({ message: "Failed to mark winner as paid." });
  }
}

module.exports = {
  listVerifications,
  uploadProof,
  approveWinner,
  rejectWinner,
  markWinnerPaid,
};
