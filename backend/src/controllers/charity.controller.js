const Charity = require("../models/Charity");
const User = require("../models/User");
const Subscription = require("../models/Subscription");

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

function toUser(user) {
  return {
    id: String(user._id),
    fullName: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    charityId: user.charityId ? String(user.charityId) : null,
    contributionPercentage: user.contributionPercentage ?? 10,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function createCharity(req, res) {
  try {
    const { name, description, image, contributionPercentage } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "name is required." });
    }

    const parsedPercentage =
      contributionPercentage === undefined ? 10 : Number(contributionPercentage);
    if (Number.isNaN(parsedPercentage) || parsedPercentage < 0 || parsedPercentage > 100) {
      return res.status(400).json({ message: "contributionPercentage must be between 0 and 100." });
    }

    const data = await Charity.create({
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : "",
      image: typeof image === "string" ? image.trim() : "",
      contributionPercentage: Math.round(parsedPercentage),
    });

    return res.status(201).json(toCharity(data));
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
    const filter = {};
    if (search && typeof search === "string") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (parsedMin !== null && !Number.isNaN(parsedMin)) {
      filter.contributionPercentage = { $gte: parsedMin };
    }

    const data = await Charity.find(filter).sort({ createdAt: sort === "asc" ? 1 : -1 }).lean();
    return res.status(200).json(data.map(toCharity));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[CHARITY][LIST] error:", error);
    return res.status(500).json({ message: "Failed to fetch charities." });
  }
}

async function selectCharity(req, res) {
  try {
    const { charityId, contributionPercentage } = req.body;

    if (!charityId) {
      return res.status(400).json({ message: "charityId is required." });
    }

    const charity = await Charity.findById(charityId).select("_id").lean();

    if (!charity) return res.status(404).json({ message: "Invalid charityId." });

    const parsedContribution =
      contributionPercentage === undefined ? null : Number(contributionPercentage);
    if (
      parsedContribution !== null &&
      (Number.isNaN(parsedContribution) || parsedContribution < 10 || parsedContribution > 100)
    ) {
      return res.status(400).json({ message: "contributionPercentage must be between 10 and 100." });
    }

    const updateData = {
      charityId,
      ...(parsedContribution !== null
        ? { contributionPercentage: Math.round(parsedContribution) }
        : {}),
    };
    const updated = await User.findByIdAndUpdate(req.user.userId, updateData, { new: true }).lean();

    return res.status(200).json({
      message: "Charity selected successfully.",
      user: toUser(updated),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[CHARITY][SELECT] error:", error);
    return res.status(500).json({ message: "Failed to select charity." });
  }
}

async function getMyCharity(req, res) {
  try {
    const user = await User.findById(req.user.userId).lean();

    if (!user || !user.charityId) {
      return res.status(404).json({ message: "No charity selected." });
    }

    const charity = await Charity.findById(user.charityId).lean();

    if (!charity) return res.status(404).json({ message: "No charity selected." });

    return res.status(200).json({
      ...toCharity(charity),
      contributionPercentage: user.contributionPercentage ?? charity.contributionPercentage,
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
      return res.status(400).json({ message: "contributionPercentage must be between 10 and 100." });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      { contributionPercentage: Math.round(parsed) },
      { new: true }
    ).lean();

    return res.status(200).json({
      id: String(updated._id),
      contributionPercentage: updated.contributionPercentage,
    });
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
      return res.status(400).json({ message: "contributionPercentage must be between 0 and 100." });
    }

    const data = await Charity.findByIdAndUpdate(
      id,
      { contributionPercentage: Math.round(parsedPercentage) },
      { new: true }
    ).lean();
    if (!data) return res.status(404).json({ message: "Charity not found." });

    return res.status(200).json(toCharity(data));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[CHARITY][UPDATE_PERCENT] error:", error);
    return res.status(500).json({ message: "Failed to update contribution percentage." });
  }
}

async function getDonationTotals(_req, res) {
  try {
    const subs = await Subscription.find({ charityId: { $ne: null } })
      .select("charityId contributionAmount")
      .lean();

    const grouped = {};
    for (const item of subs || []) {
      const key = String(item.charityId);
      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += Number(item.contributionAmount || 0);
    }

    const charityIds = Object.keys(grouped);
    if (!charityIds.length) return res.status(200).json([]);

    const charities = await Charity.find({ _id: { $in: charityIds } }).select("name").lean();
    const charityMap = new Map((charities || []).map((c) => [String(c._id), c.name]));

    const totals = charityIds.map((id) => ({
      charityId: id,
      charityName: charityMap.get(id) || "Unknown",
      totalDonations: Number(grouped[id].toFixed(2)),
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
