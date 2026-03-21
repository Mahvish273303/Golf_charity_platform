const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const { requireActiveSubscription } = require("../middleware/subscription.middleware");
const scoreController = require("../controllers/score.controller");

const router = express.Router();

router.post("/", protect, requireActiveSubscription, scoreController.addScore);
router.get("/", protect, requireActiveSubscription, scoreController.getScores);
router.patch("/:id", protect, requireActiveSubscription, scoreController.updateScore);

module.exports = router;
