const { prisma } = require("../config/db");

const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  isActive: true,
  charityId: true,
  contributionPercentage: true,
  createdAt: true,
};

async function findByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

async function createUser({
  fullName,
  email,
  passwordHash,
  role = "USER",
  charityId = null,
  contributionPercentage = 10,
}) {
  return prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role,
      charityId,
      contributionPercentage,
    },
    select: publicUserSelect,
  });
}

module.exports = {
  publicUserSelect,
  findByEmail,
  createUser,
};
