const express = require("express");
const taskController = require("../controllers/task.controller");
const { protect, requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.post("/", requireAdmin, taskController.createTask);
router.get("/", taskController.getTasks);
router.get("/stats", taskController.getTaskStats);
router.put("/:id", taskController.updateTask);

module.exports = router;
