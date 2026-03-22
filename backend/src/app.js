const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const scoreRoutes = require("./routes/score.routes");
const drawRoutes = require("./routes/draw.routes");
const charityRoutes = require("./routes/charity.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const adminRoutes = require("./routes/admin.routes");
const winnerRoutes = require("./routes/winner.routes");
const publicRoutes = require("./routes/public.routes");
const userRoutes = require("./routes/user.routes");
const { protect } = require("./middleware/auth.middleware");

const app = express();

const allowedOrigins = (
  process.env.FRONTEND_URL ||
  "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) return true;

  return allowedOrigins.some((pattern) => {
    if (pattern === origin) return true;

    if (!pattern.includes("*")) return false;

    const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    const regexPattern = `^${escapedPattern.replace(/\*/g, ".*")}$`;
    return new RegExp(regexPattern).test(origin);
  });
}

app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());

// Routes
app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/score", scoreRoutes);
app.use("/api/draw", drawRoutes);
app.use("/api/charity", charityRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/winner", winnerRoutes);
app.get("/api/test", (_req, res) => {
  return res.status(200).json({ message: "API working" });
});
if (process.env.NODE_ENV !== "production") {
  app.get("/api/debug/user", protect, (req, res) => {
    return res.status(200).json({ user: req.user });
  });
}

// Test route
app.get("/", (_req, res) => {
  res.send("API is working");
});

app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON payload." });
  }
  return next(err);
});

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error("[APP] Unhandled error:", err);
  return res.status(500).json({ message: "Internal server error." });
});

module.exports = app;