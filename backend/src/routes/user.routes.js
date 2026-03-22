const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.patch("/select-charity", verifyToken, userController.selectCharity);

module.exports = router;
