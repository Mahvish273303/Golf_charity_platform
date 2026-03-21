const { prisma } = require("../config/db");

async function requireActiveSubscription(req, res, next) {
  try {
    const latestSubscription = await prisma.subscription.findFirst({
      where: { userId: req.user.userId, isActive: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, endDate: true },
    });

    if (!latestSubscription) {
      return res.status(403).json({ message: "Active subscription required." });
    }

    if (new Date(latestSubscription.endDate) <= new Date()) {
      await prisma.subscription.update({
        where: { id: latestSubscription.id },
        data: { isActive: false },
      });
      return res.status(403).json({ message: "Subscription has expired." });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ message: "Failed to validate subscription." });
  }
}

module.exports = {
  requireActiveSubscription,
};
