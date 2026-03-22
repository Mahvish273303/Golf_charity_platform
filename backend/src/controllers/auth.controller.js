const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Charity = require("../models/Charity");

function buildToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" }
  );
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

async function getMe(req, res) {
  return res.status(200).json({ user: req.user });
}

async function signup(req, res) {
  try {
    const { fullName, name, email, password, charityId, contributionPercentage } = req.body || {};
    const resolvedName = (fullName || name || "").trim();
    if (!resolvedName || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const createData = {
      name: resolvedName,
      email: normalizedEmail,
      password: passwordHash,
      role: "USER",
      isActive: true,
      contributionPercentage: 10,
    };

    if (charityId) {
      const charity = await Charity.findById(charityId).lean();
      if (!charity) {
        return res.status(400).json({ message: "Invalid charity selected." });
      }
      createData.charityId = charity._id;
    }

    if (contributionPercentage !== undefined) {
      const parsed = Number(contributionPercentage);
      if (!Number.isNaN(parsed) && parsed >= 10 && parsed <= 100) {
        createData.contributionPercentage = Math.round(parsed);
      }
    }

    const user = await User.create({
      ...createData,
    });

    const token = buildToken(user);
    return res.status(201).json({ user: toUser(user), token });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated." });
    }

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

    const token = buildToken(user);
    return res.status(200).json({
      user: toUser(user),
      role: user.role,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed." });
  }
}

async function manualLogin(req, res) {
  return login(req, res);
}

module.exports = { getMe, signup, login, manualLogin };
