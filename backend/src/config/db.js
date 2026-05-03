const dns = require("dns");
const mongoose = require("mongoose");

// Override system DNS with public resolvers so that mongodb+srv:// SRV
// record lookups (querySrv) succeed even when the local DNS blocks them.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  // eslint-disable-next-line no-console
  console.log("[DB] MONGO_URI loaded:", uri ? "YES" : "NO — check your .env file");

  try {
    await mongoose.connect(uri, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
    });
    // eslint-disable-next-line no-console
    console.log("MongoDB Connected");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[DB] Connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
