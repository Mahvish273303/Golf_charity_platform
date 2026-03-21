const express = require("express");
const subscriptionController = require("../controllers/subscription.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/subscribe", protect, subscriptionController.subscribe);
router.get("/status", protect, subscriptionController.getStatus);
router.post("/cancel", protect, subscriptionController.cancelSubscription);

module.exports = router;
