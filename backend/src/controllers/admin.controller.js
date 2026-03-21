const { prisma } = require("../config/db");

async function getAllUsers(_req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        charityId: true,
        createdAt: true,
      },
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users." });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { fullName, role, isActive, charityId } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName !== undefined ? { fullName } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(charityId !== undefined ? { charityId } : {}),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        charityId: true,
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user." });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
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

    const score = await prisma.score.update({
      where: { id },
      data: {
        value,
        ...(playedAt ? { playedAt: new Date(playedAt) } : {}),
      },
    });
    return res.status(200).json(score);
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

    const charity = await prisma.charity.create({
      data: {
        name: name.trim(),
        description: description || null,
        image: image || null,
        contributionPercentage: Math.max(0, Math.min(100, Number(contributionPercentage) || 10)),
      },
    });
    return res.status(201).json(charity);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add charity." });
  }
}

async function adminUpdateCharity(req, res) {
  try {
    const { id } = req.params;
    const { name, description, image, contributionPercentage } = req.body;
    const charity = await prisma.charity.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(contributionPercentage !== undefined
          ? { contributionPercentage: Math.max(0, Math.min(100, Number(contributionPercentage))) }
          : {}),
      },
    });
    return res.status(200).json(charity);
  } catch (error) {
    return res.status(500).json({ message: "Failed to edit charity." });
  }
}

async function adminDeleteCharity(req, res) {
  try {
    const { id } = req.params;
    await prisma.charity.delete({ where: { id } });
    return res.status(200).json({ message: "Charity deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete charity." });
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
    return res.status(200).json({ draw: latestPublished, results });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch draw results." });
  }
}

async function getReports(_req, res) {
  try {
    const [totalUsers, draws, donationSum] = await Promise.all([
      prisma.user.count(),
      prisma.draw.findMany({
        where: { isPublished: true },
        select: { totalPool: true },
      }),
      prisma.subscription.aggregate({
        _sum: { contributionAmount: true },
      }),
    ]);

    const totalPrizePool = draws.reduce((sum, draw) => sum + Number(draw.totalPool), 0);

    return res.status(200).json({
      totalUsers,
      totalPrizePool: Number(totalPrizePool.toFixed(2)),
      totalDonations: Number(donationSum._sum.contributionAmount || 0),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load reports." });
  }
}

async function getSubscriptions(_req, res) {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        charity: {
          select: { id: true, name: true },
        },
      },
    });
    return res.status(200).json(subscriptions);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch subscriptions." });
  }
}

async function updateSubscription(req, res) {
  try {
    const { id } = req.params;
    const { isActive, endDate, plan } = req.body;
    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        ...(isActive !== undefined ? { isActive } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
        ...(plan ? { plan } : {}),
      },
    });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update subscription." });
  }
}

async function getVerifications(req, res) {
  try {
    const { status } = req.query;
    const where = {};
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(String(status).toUpperCase())) {
      where.status = String(status).toUpperCase();
    }
    const list = await prisma.winnerVerification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        result: { select: { matchTier: true, prizeAmount: true } },
      },
    });
    return res.status(200).json(list);
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
