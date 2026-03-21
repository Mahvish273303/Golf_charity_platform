const { prisma } = require("../config/db");

function computeEndDate(plan) {
  const now = new Date();
  const endDate = new Date(now);

  if (plan === "yearly") {
    endDate.setDate(endDate.getDate() + 365);
  } else {
    endDate.setDate(endDate.getDate() + 30);
  }

  return { startDate: now, endDate };
}

function planAmount(plan) {
  return plan === "yearly" ? 1000 : 100;
}

async function expireCurrentSubscription(userId) {
  const active = await prisma.subscription.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (active && new Date(active.endDate) <= new Date()) {
    await prisma.subscription.update({
      where: { id: active.id },
      data: { isActive: false },
    });
  }
}

async function subscribe(req, res) {
  try {
    const { plan } = req.body;
    const userId = req.user.userId;

    if (plan !== "monthly" && plan !== "yearly") {
      return res.status(400).json({ message: "plan must be either 'monthly' or 'yearly'." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        charityId: true,
        contributionPercentage: true,
        charity: {
          select: {
            contributionPercentage: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const { startDate, endDate } = computeEndDate(plan);
    const baseAmount = planAmount(plan);
    const contributionPercentage = Math.max(
      10,
      Number(user.contributionPercentage ?? user.charity?.contributionPercentage ?? 10)
    );
    const contributionAmount = Number(
      ((baseAmount * contributionPercentage) / 100).toFixed(2)
    );

    await prisma.subscription.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        charityId: user.charityId,
        plan,
        startDate,
        endDate,
        isActive: true,
        contributionAmount,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    return res.status(201).json({
      message: "Subscription created successfully.",
      subscription,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[SUBSCRIPTION][SUBSCRIBE] error:", error);
    return res.status(500).json({ message: "Failed to create subscription." });
  }
}

async function getStatus(req, res) {
  try {
    const userId = req.user.userId;
    await expireCurrentSubscription(userId);

    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        plan: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
    });

    if (!subscription) {
      return res.status(200).json({
        active: false,
        expiryDate: null,
      });
    }

    const now = new Date();
    const active = subscription.isActive && subscription.endDate > now;

    return res.status(200).json({
      active,
      expiryDate: subscription.endDate,
      subscription,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[SUBSCRIPTION][STATUS] error:", error);
    return res.status(500).json({ message: "Failed to fetch subscription status." });
  }
}

async function cancelSubscription(req, res) {
  try {
    const userId = req.user.userId;
    await expireCurrentSubscription(userId);

    const subscription = await prisma.subscription.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found." });
    }

    const canceled = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { isActive: false },
    });

    return res.status(200).json({
      message: "Subscription canceled successfully.",
      subscription: canceled,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[SUBSCRIPTION][CANCEL] error:", error);
    return res.status(500).json({ message: "Failed to cancel subscription." });
  }
}

module.exports = {
  subscribe,
  getStatus,
  cancelSubscription,
};
