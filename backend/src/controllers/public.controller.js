const { prisma } = require("../config/db");

async function getOverview(_req, res) {
  try {
    const [usersCount, activeSubscriptions, latestDraw, charities, donationAgg] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({
        where: {
          isActive: true,
          endDate: { gt: new Date() },
        },
      }),
      prisma.draw.findFirst({
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          numbers: true,
          createdAt: true,
          totalPool: true,
          jackpotRollover: true,
        },
      }),
      prisma.charity.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.subscription.aggregate({
        _sum: { contributionAmount: true },
      }),
    ]);

    return res.status(200).json({
      stats: {
        usersCount,
        activeSubscriptions,
        totalDonations: Number(donationAgg._sum.contributionAmount || 0),
      },
      latestDraw,
      charities,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load public overview." });
  }
}

module.exports = {
  getOverview,
};
