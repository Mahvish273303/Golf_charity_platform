const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Draw = require("../models/Draw");
const Charity = require("../models/Charity");

function toDraw(draw) {
  if (!draw) return null;
  return {
    id: String(draw._id),
    numbers: draw.numbers || [],
    monthKey: draw.monthKey,
    isPublished: draw.isPublished,
    totalPool: draw.totalPool || 0,
    jackpotRollover: draw.jackpotRollover || 0,
    createdById: draw.createdById ? String(draw.createdById) : null,
    publishedAt: draw.publishedAt || null,
    createdAt: draw.createdAt,
    updatedAt: draw.updatedAt,
  };
}

function toCharity(charity) {
  return {
    id: String(charity._id),
    name: charity.name,
    description: charity.description,
    image: charity.image,
    contributionPercentage: charity.contributionPercentage,
    createdAt: charity.createdAt,
    updatedAt: charity.updatedAt,
  };
}

async function getOverview(_req, res) {
  try {
    const [usersCount, activeSubscriptions, latestDrawRes, charitiesRes, subsAllRes] = await Promise.all([
      User.countDocuments(),
      Subscription.countDocuments({ isActive: true, endDate: { $gt: new Date() } }),
      Draw.findOne({ isPublished: true })
        .sort({ publishedAt: -1 })
        .select("numbers monthKey isPublished totalPool jackpotRollover createdById publishedAt createdAt updatedAt")
        .lean(),
      Charity.find().sort({ createdAt: -1 }).limit(6).lean(),
      Subscription.find().select("contributionAmount").lean(),
    ]);

    const totalDonations = subsAllRes.reduce(
      (sum, s) => sum + Number(s.contributionAmount || 0),
      0
    );

    return res.status(200).json({
      stats: {
        usersCount,
        activeSubscriptions,
        totalDonations: Number(totalDonations.toFixed(2)),
      },
      latestDraw: latestDrawRes ? toDraw(latestDrawRes) : null,
      charities: charitiesRes.map(toCharity),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load public overview." });
  }
}

module.exports = { getOverview };
