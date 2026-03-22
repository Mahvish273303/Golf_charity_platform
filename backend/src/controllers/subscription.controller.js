const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Charity = require("../models/Charity");

function toSubscription(subscription) {
  return {
    id: String(subscription._id),
    userId: String(subscription.userId),
    charityId: subscription.charityId ? String(subscription.charityId) : null,
    plan: subscription.plan,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    isActive: subscription.isActive,
    contributionAmount: subscription.contributionAmount,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
  };
}

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

async function expireCurrentSubscription(db, userId) {
  const active = await Subscription.findOne({ userId, isActive: true }).sort({ createdAt: -1 });
  if (active && new Date(active.endDate) <= new Date()) {
    active.isActive = false;
    await active.save();
  }
}

async function subscribe(req, res) {
  try {
    const { plan } = req.body;
    const userId = req.user.userId;

    if (plan !== "monthly" && plan !== "yearly") {
      return res.status(400).json({ message: "plan must be either 'monthly' or 'yearly'." });
    }

    const user = await User.findById(userId).lean();

    if (!user) return res.status(404).json({ message: "User not found." });

    // Get charity's default contribution if user hasn't set their own
    let charityContributionPct = 10;
    if (user.charityId) {
      const charity = await Charity.findById(user.charityId).lean();
      if (charity) charityContributionPct = charity.contributionPercentage;
    }

    const { startDate, endDate } = computeEndDate(plan);
    const baseAmount = planAmount(plan);
    const contributionPercentage = Math.max(
      10,
      Number(user.contributionPercentage ?? charityContributionPct ?? 10)
    );
    const contributionAmount = Number(((baseAmount * contributionPercentage) / 100).toFixed(2));

    // Deactivate any existing active subscriptions
    await Subscription.updateMany({ userId, isActive: true }, { isActive: false });

    const subscription = await Subscription.create({
      userId,
      charityId: user.charityId || null,
      plan,
      startDate,
      endDate,
      isActive: true,
      contributionAmount,
    });

    // Ensure user is marked active
    await User.updateOne({ _id: userId }, { isActive: true });

    return res.status(201).json({
      message: "Subscription created successfully.",
      subscription: toSubscription(subscription),
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
    await expireCurrentSubscription(null, userId);

    const subscription = await Subscription.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!subscription) {
      return res.status(200).json({ active: false, expiryDate: null });
    }

    const active = subscription.isActive && new Date(subscription.endDate) > new Date();

    return res.status(200).json({
      active,
      expiryDate: subscription.endDate,
      subscription: toSubscription(subscription),
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
    await expireCurrentSubscription(null, userId);

    const subscription = await Subscription.findOne({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found." });
    }

    const canceled = await Subscription.findByIdAndUpdate(
      subscription._id,
      { isActive: false },
      { new: true }
    ).lean();

    return res.status(200).json({
      message: "Subscription canceled successfully.",
      subscription: toSubscription(canceled),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[SUBSCRIPTION][CANCEL] error:", error);
    return res.status(500).json({ message: "Failed to cancel subscription." });
  }
}

module.exports = { subscribe, getStatus, cancelSubscription };
