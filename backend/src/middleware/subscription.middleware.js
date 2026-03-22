const Subscription = require("../models/Subscription");

async function requireActiveSubscription(req, res, next) {
  try {
    const sub = await Subscription.findOne({
      userId: req.user.userId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!sub) {
      return res.status(403).json({ message: "Active subscription required." });
    }

    if (new Date(sub.endDate) <= new Date()) {
      await Subscription.updateOne({ _id: sub._id }, { isActive: false });
      return res.status(403).json({ message: "Subscription has expired." });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ message: "Failed to validate subscription." });
  }
}

module.exports = { requireActiveSubscription };
