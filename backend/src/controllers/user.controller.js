const User = require("../models/User");
const Charity = require("../models/Charity");

async function selectCharity(req, res) {
  try {
    const { charityId, contributionPercentage } = req.body || {};
    if (!charityId) {
      return res.status(400).json({ message: "charityId is required." });
    }

    const charity = await Charity.findById(charityId).lean();
    if (!charity) {
      return res.status(404).json({ message: "Charity not found." });
    }

    const updateData = { charityId };
    if (contributionPercentage !== undefined) {
      const parsed = Number(contributionPercentage);
      if (Number.isNaN(parsed) || parsed < 10 || parsed > 100) {
        return res.status(400).json({ message: "contributionPercentage must be between 10 and 100." });
      }
      updateData.contributionPercentage = Math.round(parsed);
    }

    const user = await User.findByIdAndUpdate(req.user.userId, updateData, { new: true }).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "Charity selected successfully.",
      user: {
        id: String(user._id),
        fullName: user.name,
        email: user.email,
        role: user.role,
        charityId: user.charityId ? String(user.charityId) : null,
        contributionPercentage: user.contributionPercentage ?? 10,
      },
      charity: {
        id: String(charity._id),
        name: charity.name,
        description: charity.description,
        image: charity.image,
        contributionPercentage: charity.contributionPercentage,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to select charity." });
  }
}

module.exports = { selectCharity };
