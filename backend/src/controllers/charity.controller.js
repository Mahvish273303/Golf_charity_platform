const { prisma } = require("../config/db");

async function createCharity(req, res) {
  try {
    const { name, description, image, contributionPercentage } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "name is required." });
    }

    const parsedPercentage =
      contributionPercentage === undefined ? 10 : Number(contributionPercentage);
    if (Number.isNaN(parsedPercentage) || parsedPercentage < 0 || parsedPercentage > 100) {
      return res
        .status(400)
        .json({ message: "contributionPercentage must be between 0 and 100." });
    }

    const charity = await prisma.charity.create({
      data: {
        name: name.trim(),
        description: typeof description === "string" ? description.trim() : null,
        image: typeof image === "string" ? image.trim() : null,
        contributionPercentage: Math.round(parsedPercentage),
      },
    });

    return res.status(201).json(charity);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[CHARITY][CREATE] error:", error);
    return res.status(500).json({ message: "Failed to create charity." });
  }
}

async function getAllCharities(req, res) {
  try {
    const { search, minPercentage, sort = "desc" } = req.query;
    const parsedMin = minPercentage !== undefined ? Number(minPercentage) : null;
    const where = {};

    if (search && typeof search === "string") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (parsedMin !== null && !Number.isNaN(parsedMin)) {
      where.contributionPercentage = { gte: parsedMin };
    }

    const charities = await prisma.charity.findMany({
      where,
      orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
    });

    return res.status(200).json(charities);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[CHARITY][LIST] error:", error);
    return res.status(500).json({ message: "Failed to fetch charities." });
  }
}

async function selectCharity(req, res) {
  try {
    const { charityId, contributionPercentage } = req.body;

    if (!charityId || typeof charityId !== "string") {
      return res.status(400).json({ message: "charityId is required." });
    }

    const charity = await prisma.charity.findUnique({
      where: { id: charityId },
      select: { id: true },
    });

    if (!charity) {
      return res.status(404).json({ message: "Invalid charityId." });
    }

    const parsedContribution =
      contributionPercentage === undefined ? null : Number(contributionPercentage);
    if (
      parsedContribution !== null &&
      (Number.isNaN(parsedContribution) || parsedContribution < 10 || parsedContribution > 100)
    ) {
      return res
        .status(400)
        .json({ message: "contributionPercentage must be between 10 and 100." });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        charityId,
        ...(parsedContribution !== null
          ? { contributionPercentage: Math.round(parsedContribution) }
          : {}),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        charityId: true,
        contributionPercentage: true,
      },
    });

    return res.status(200).json({
      message: "Charity selected successfully.",
      user,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[CHARITY][SELECT] error:", error);
    return res.status(500).json({ message: "Failed to select charity." });
  }
}

async function getMyCharity(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        contributionPercentage: true,
        charity: true,
      },
    });

    if (!user || !user.charity) {
      return res.status(404).json({ message: "No charity selected." });
    }

    return res.status(200).json({
      ...user.charity,
      contributionPercentage: user.contributionPercentage ?? user.charity.contributionPercentage,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[CHARITY][ME] error:", error);
    return res.status(500).json({ message: "Failed to fetch selected charity." });
  }
}

async function updateMyContribution(req, res) {
  try {
    const { contributionPercentage } = req.body;
    const parsed = Number(contributionPercentage);

    if (Number.isNaN(parsed) || parsed < 10 || parsed > 100) {
      return res
        .status(400)
        .json({ message: "contributionPercentage must be between 10 and 100." });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { contributionPercentage: Math.round(parsed) },
      select: {
        id: true,
        contributionPercentage: true,
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update contribution percentage." });
  }
}

async function updateContributionPercentage(req, res) {
  try {
    const { id } = req.params;
    const { contributionPercentage } = req.body;
    const parsedPercentage = Number(contributionPercentage);

    if (Number.isNaN(parsedPercentage) || parsedPercentage < 0 || parsedPercentage > 100) {
      return res
        .status(400)
        .json({ message: "contributionPercentage must be between 0 and 100." });
    }

    const charity = await prisma.charity.update({
      where: { id },
      data: { contributionPercentage: Math.round(parsedPercentage) },
    });

    return res.status(200).json(charity);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[CHARITY][UPDATE_PERCENT] error:", error);
    return res.status(500).json({ message: "Failed to update contribution percentage." });
  }
}

async function getDonationTotals(_req, res) {
  try {
    const grouped = await prisma.subscription.groupBy({
      by: ["charityId"],
      _sum: { contributionAmount: true },
      where: { charityId: { not: null } },
    });

    const charityIds = grouped.map((item) => item.charityId).filter(Boolean);
    const charities = await prisma.charity.findMany({
      where: { id: { in: charityIds } },
      select: { id: true, name: true },
    });
    const charityMap = new Map(charities.map((charity) => [charity.id, charity.name]));

    const totals = grouped.map((item) => ({
      charityId: item.charityId,
      charityName: charityMap.get(item.charityId) || "Unknown",
      totalDonations: Number(item._sum.contributionAmount || 0),
    }));

    return res.status(200).json(totals);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[CHARITY][TOTAL_DONATIONS] error:", error);
    return res.status(500).json({ message: "Failed to fetch donation totals." });
  }
}

module.exports = {
  createCharity,
  getAllCharities,
  selectCharity,
  getMyCharity,
  updateMyContribution,
  updateContributionPercentage,
  getDonationTotals,
};
