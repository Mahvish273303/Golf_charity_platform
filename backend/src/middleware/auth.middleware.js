const { prisma } = require("../config/db");
const { verifyToken } = require("../utils/jwt.util");

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    req.user = { userId: decoded.userId };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

async function requireAdmin(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive || user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required." });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ message: "Failed to authorize admin user." });
  }
}

module.exports = {
  protect,
  requireAdmin,
};