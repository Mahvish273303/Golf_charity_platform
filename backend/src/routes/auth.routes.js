const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/manual-login", authController.manualLogin);
router.get("/me", protect, authController.getMe);

module.exports = router;
