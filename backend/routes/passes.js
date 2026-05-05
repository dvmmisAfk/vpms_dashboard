// routes/passes.js
const express = require("express");
const { body, param } = require("express-validator");

const router = express.Router();

const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
  generatePass,
  listPasses,
  myPass,
  getPass,
  verifyPass,
  deactivatePass,
} = require("../controllers/passController");
const { ROLES } = require("../utils/constants");

router.post(
  "/generate/:visitorId",
  auth,
  roleCheck([ROLES.ADMIN, ROLES.SECURITY]),
  [
    param("visitorId").isMongoId(),
    body("validFrom").isISO8601().toDate(),
    body("validUntil").isISO8601().toDate(),
    body("appointment").optional().isMongoId(),
  ],
  generatePass,
);

router.get("/", auth, roleCheck([ROLES.ADMIN, ROLES.SECURITY]), listPasses);

router.get("/my", auth, roleCheck([ROLES.VISITOR]), myPass);

router.get("/verify/:passCode", [param("passCode").notEmpty()], verifyPass);

router.get("/:id", auth, roleCheck([ROLES.ADMIN, ROLES.SECURITY]), [param("id").isMongoId()], getPass);

router.put("/:id/deactivate", auth, roleCheck([ROLES.ADMIN, ROLES.SECURITY]), [param("id").isMongoId()], deactivatePass);

module.exports = router;
