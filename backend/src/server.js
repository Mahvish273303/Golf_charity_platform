require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const PORT = process.env.PORT || 4000;
let server;

async function shutdown(signal) {
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Graceful shutdown failed:", error.message);
    process.exit(1);
  }
}

async function startServer() {
  try {
    await connectDB();
    await ensureAdminUser();
    server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

async function ensureAdminUser() {
  const email = "mahvishpathan354@gmail.com";
  const passwordHash = await bcrypt.hash("123456", 10);
  const existing = await User.findOne({ email });
  if (existing) {
    existing.name = "Mahvish Pathan";
    existing.role = "ADMIN";
    existing.isActive = true;
    existing.password = passwordHash;
    await existing.save();
    return;
  }
  await User.create({
    name: "Mahvish Pathan",
    email,
    password: passwordHash,
    role: "ADMIN",
    isActive: true,
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", async (reason) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled rejection:", reason);
  await shutdown("unhandledRejection");
});
process.on("uncaughtException", async (error) => {
  // eslint-disable-next-line no-console
  console.error("Uncaught exception:", error);
  await shutdown("uncaughtException");
});

startServer();