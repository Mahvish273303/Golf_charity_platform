const express = require("express");
const charityController = require("../controllers/charity.controller");
const { protect, requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, requireAdmin, charityController.createCharity);
router.get("/", charityController.getAllCharities);
router.post("/select", protect, charityController.selectCharity);
router.get("/me", protect, charityController.getMyCharity);
router.patch("/me/contribution", protect, charityController.updateMyContribution);
router.patch(
  "/:id/contribution",
  protect,
  requireAdmin,
  charityController.updateContributionPercentage
);
router.get("/donations/total", protect, requireAdmin, charityController.getDonationTotals);

module.exports = router;
