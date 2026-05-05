// routes/analytics.js
const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const { ROLES } = require("../utils/constants");
const analyticsController = require("../controllers/analyticsController");

router.get("/summary", auth, roleCheck([ROLES.ADMIN]), analyticsController.summary);

router.get("/peak-hours", auth, roleCheck([ROLES.ADMIN]), analyticsController.peakHours);

router.get("/average-duration", auth, roleCheck([ROLES.ADMIN]), analyticsController.averageDuration);

module.exports = router;
