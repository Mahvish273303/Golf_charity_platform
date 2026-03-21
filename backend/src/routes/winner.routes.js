const express = require("express");
const winnerController = require("../controllers/winner.controller");
const { protect, requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, requireAdmin, winnerController.listVerifications);
router.post("/proof", protect, winnerController.uploadProof);
router.patch("/:id/approve", protect, requireAdmin, winnerController.approveWinner);
router.patch("/:id/reject", protect, requireAdmin, winnerController.rejectWinner);
router.patch("/:id/paid", protect, requireAdmin, winnerController.markWinnerPaid);

module.exports = router;
