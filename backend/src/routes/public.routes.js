const express = require("express");
const publicController = require("../controllers/public.controller");

const router = express.Router();

router.get("/overview", publicController.getOverview);

module.exports = router;
