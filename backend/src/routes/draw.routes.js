const express = require("express");
const drawController = require("../controllers/draw.controller");
const { protect, requireAdmin } = require("../middleware/auth.middleware");
const { requireActiveSubscription } = require("../middleware/subscription.middleware");

const router = express.Router();

router.post("/generate", protect, requireAdmin, drawController.generateDraw);
router.post("/publish", protect, requireAdmin, drawController.publishDraw);
router.post("/simulate-monthly", protect, requireAdmin, drawController.simulateMonthlyDraw);
router.get("/preview", protect, requireAdmin, drawController.previewDraw);
router.get("/latest", drawController.getLatestDraw);
router.get("/result", protect, requireActiveSubscription, drawController.getUserResult);
router.get("/winnings", protect, drawController.getUserWinnings);
router.get("/results", protect, requireAdmin, drawController.getDrawResults);

module.exports = router;
