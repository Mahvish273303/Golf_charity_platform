const bcrypt = require("bcrypt");
const UserModel = require("../models/user.model");
const { signToken } = require("../utils/jwt.util");
const { prisma } = require("../config/db");

async function register(req, res) {
  try {
    const { fullName, email, password, charityId, contributionPercentage } = req.body;
    const trimmedFullName = typeof fullName === "string" ? fullName.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";

    if (!trimmedFullName || !normalizedEmail || !password) {
      return res
        .status(400)
        .json({ message: "fullName, email and password are required." });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: "A valid email is required." });
    }

    const existingUser = await UserModel.findByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    let validatedCharityId = null;
    if (charityId !== undefined && charityId !== null && charityId !== "") {
      const charity = await prisma.charity.findUnique({
        where: { id: String(charityId) },
        select: { id: true },
      });
      if (!charity) {
        return res.status(400).json({ message: "Invalid charityId." });
      }
      validatedCharityId = charity.id;
    }

    const parsedContribution =
      contributionPercentage === undefined ? 10 : Number(contributionPercentage);
    if (Number.isNaN(parsedContribution) || parsedContribution < 10 || parsedContribution > 100) {
      return res
        .status(400)
        .json({ message: "contributionPercentage must be between 10 and 100." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.createUser({
      fullName: trimmedFullName,
      email: normalizedEmail,
      passwordHash,
      role: "USER",
      charityId: validatedCharityId,
      contributionPercentage: Math.round(parsedContribution),
    });

    const token = signToken({ userId: user.id });
    return res.status(201).json({ user, token });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[AUTH][REGISTER] error:", error);
    return res.status(500).json({ message: "Registration failed." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "email and password must be strings." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken({ userId: user.id });
    return res.status(200).json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        charityId: user.charityId,
        contributionPercentage: user.contributionPercentage,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[AUTH][LOGIN] error:", error);
    return res.status(500).json({ message: "Login failed." });
  }
}

module.exports = {
  register,
  login,
};