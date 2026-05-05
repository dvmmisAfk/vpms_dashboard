// routes/visitors.js
const express = require("express");
const { body, param } = require("express-validator");

const router = express.Router();

const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const upload = require("../middleware/upload");
const {
  createVisitor,
  listVisitors,
  getVisitor,
  updateVisitor,
  removeVisitor,
  approveVisitor,
  rejectVisitor,
} = require("../controllers/visitorController");
const { ROLES, VISITOR_STATUSES } = require("../utils/constants");

router.post(
  "/",
  auth,
  roleCheck([ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.SECURITY]),
  upload.single("photo"),
  [
    body("name").trim().notEmpty(),
    body("email").optional().isEmail(),
    body("phone").optional().trim(),
    body("company").optional().trim(),
    body("purpose").optional().trim(),
    body("host").isMongoId(),
  ],
  createVisitor,
);

router.get(
  "/",
  auth,
  roleCheck([ROLES.ADMIN, ROLES.SECURITY]),
  listVisitors,
);

router.get(
  "/:id",
  auth,
  roleCheck([ROLES.ADMIN, ROLES.SECURITY]),
  [param("id").isMongoId()],
  getVisitor,
);

router.put(
  "/:id",
  auth,
  roleCheck([ROLES.ADMIN, ROLES.SECURITY]),
  [param("id").isMongoId()],
  [
    body("name").optional().trim().notEmpty(),
    body("email").optional().isEmail(),
    body("phone").optional().trim(),
    body("company").optional().trim(),
    body("purpose").optional().trim(),
    body("status").optional().isIn(Object.values(VISITOR_STATUSES)),
  ],
  updateVisitor,
);

router.delete(
  "/:id",
  auth,
  roleCheck([ROLES.ADMIN]),
  [param("id").isMongoId()],
  removeVisitor,
);

router.put(
  "/:id/approve",
  auth,
  roleCheck([ROLES.ADMIN, ROLES.EMPLOYEE]),
  [param("id").isMongoId()],
  approveVisitor,
);

router.put(
  "/:id/reject",
  auth,
  roleCheck([ROLES.ADMIN, ROLES.EMPLOYEE]),
  [param("id").isMongoId()],
  rejectVisitor,
);

module.exports = router;
