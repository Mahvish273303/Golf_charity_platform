const express = require("express");
const adminController = require("../controllers/admin.controller");
const drawController = require("../controllers/draw.controller");
const { protect, requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/users", adminController.getAllUsers);
router.patch("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.patch("/scores/:id", adminController.updateScore);

router.post("/charity", adminController.adminCreateCharity);
router.patch("/charity/:id", adminController.adminUpdateCharity);
router.delete("/charity/:id", adminController.adminDeleteCharity);

router.post("/draw/generate", drawController.generateDraw);
router.get("/draw/preview", drawController.previewDraw);
router.post("/draw/simulate-monthly", drawController.simulateMonthlyDraw);
router.post("/draw/publish", drawController.publishDraw);
router.get("/draw/results", adminController.getDrawResults);
router.get("/subscriptions", adminController.getSubscriptions);
router.patch("/subscriptions/:id", adminController.updateSubscription);
router.get("/verifications", adminController.getVerifications);
router.get("/reports", adminController.getReports);

module.exports = router;
