require("dotenv").config();
const app = require("./app");
const { connectDB, disconnectDB } = require("./config/db");

const PORT = process.env.PORT || 4000;
let server;

async function shutdown(signal) {
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
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
    server = app.listen(PORT);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
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