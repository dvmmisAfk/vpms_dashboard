// routes/dashboard.js
const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const { dashboardStats, recentCheckIns, exportVisitors } = require("../controllers/dashboardController");
const { ROLES } = require("../utils/constants");

router.get("/stats", auth, roleCheck([ROLES.ADMIN, ROLES.SECURITY, ROLES.EMPLOYEE]), dashboardStats);

router.get("/recent", auth, roleCheck([ROLES.ADMIN, ROLES.SECURITY, ROLES.EMPLOYEE]), recentCheckIns);

router.get("/export", auth, roleCheck([ROLES.ADMIN, ROLES.SECURITY]), exportVisitors);

module.exports = router;
