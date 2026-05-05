// routes/audit.js
const express = require("express");
const { query } = require("express-validator");

const router = express.Router();

const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const { ROLES } = require("../utils/constants");
const { listAuditLogs } = require("../controllers/auditController");

router.get(
  "/",
  auth,
  roleCheck([ROLES.ADMIN]),
  [
    query("actor").optional().isMongoId(),
    query("action").optional().trim(),
    query("targetModel").optional().trim(),
    query("start").optional().isISO8601().toDate(),
    query("end").optional().isISO8601().toDate(),
  ],
  listAuditLogs,
);

module.exports = router;
