// routes/checks.js
const express = require("express");
const { body, query } = require("express-validator");

const router = express.Router();

const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const { checkIn, checkOut, listLogs } = require("../controllers/checkController");
const { ROLES } = require("../utils/constants");

router.post(
  "/check-in",
  auth,
  roleCheck([ROLES.ADMIN, ROLES.SECURITY]),
  [
    body("passCode").notEmpty(),
    body("notes").optional().trim(),
    body("location").optional().trim(),
  ],
  checkIn,
);

router.post(
  "/check-out",
  auth,
  roleCheck([ROLES.ADMIN, ROLES.SECURITY]),
  [
    body("passCode").notEmpty(),
    body("notes").optional().trim(),
    body("location").optional().trim(),
  ],
  checkOut,
);

router.get(
  "/logs",
  auth,
  roleCheck([ROLES.ADMIN, ROLES.SECURITY]),
  [
    query("action").optional().isIn(['check-in', 'check-out']),
    query("visitor").optional().isMongoId(),
    query("start").optional().isISO8601().toDate(),
    query("end").optional().isISO8601().toDate(),
  ],
  listLogs,
);

module.exports = router;
