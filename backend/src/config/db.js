const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
let isConnected = false;

async function connectDB() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  try {
    await prisma.$connect();
    isConnected = true;
  } catch (error) {
    isConnected = false;
    // eslint-disable-next-line no-console
    console.error("Database connection failed:", error.message);
    throw error;
  }
}

async function disconnectDB() {
  if (!isConnected) return;
  await prisma.$disconnect();
  isConnected = false;
}

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
};
