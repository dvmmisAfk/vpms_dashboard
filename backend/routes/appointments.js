// routes/appointments.js
const express = require("express");
const { body, param } = require("express-validator");

const router = express.Router();

const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const upload = require("../middleware/upload");
const {
  createAppointment,
  listAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  approveAppointment,
  completePreRegistration,
} = require("../controllers/appointmentController");
const { ROLES, APPOINTMENT_STATUSES } = require("../utils/constants");

router.post(
  "/:token/pre-register",
  upload.single("photo"),
  [
    param("token").notEmpty(),
    body("name").optional().trim().notEmpty(),
    body("phone").optional().trim(),
    body("company").optional().trim(),
    body("purpose").optional().trim(),
  ],
  completePreRegistration,
);

router.post(
  "/",
  auth,
  roleCheck([ROLES.ADMIN, ROLES.EMPLOYEE]),
  [
    body("visitorName").trim().notEmpty(),
    body("visitorEmail").optional().isEmail(),
    body("visitorPhone").optional().trim(),
    body("company").optional().trim(),
    body("purpose").optional().trim(),
    body("scheduledAt").isISO8601().toDate(),
    body("notes").optional().trim(),
    body("host").optional({ values: "falsy" }).isMongoId(),
    body("location").optional().trim(),
  ],
  createAppointment,
);

router.get("/", auth, listAppointments);

router.get("/:id", auth, [param("id").isMongoId()], getAppointment);

router.put(
  "/:id",
  auth,
  roleCheck([ROLES.ADMIN, ROLES.EMPLOYEE]),
  [param("id").isMongoId()],
  [
    body("scheduledAt").optional().isISO8601().toDate(),
    body("purpose").optional().trim(),
    body("notes").optional().trim(),
    body("status").optional().isIn(Object.values(APPOINTMENT_STATUSES)),
  ],
  updateAppointment,
);

router.delete("/:id", auth, roleCheck([ROLES.ADMIN, ROLES.EMPLOYEE]), [param("id").isMongoId()], cancelAppointment);

router.post(
  "/:id/approve",
  auth,
  roleCheck([ROLES.ADMIN, ROLES.EMPLOYEE]),
  [param("id").isMongoId()],
  approveAppointment,
);

module.exports = router;
