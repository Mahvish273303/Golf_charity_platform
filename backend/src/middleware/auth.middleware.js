const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findById(payload.sub).lean();
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    req.user = {
      userId: String(user._id),
      id: String(user._id),
      fullName: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      charityId: user.charityId ? String(user.charityId) : null,
      contributionPercentage: user.contributionPercentage ?? 10,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

async function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required." });
  }
  return next();
}

const verifyToken = protect;
const checkAdmin = requireAdmin;

module.exports = { protect, requireAdmin, verifyToken, checkAdmin };
