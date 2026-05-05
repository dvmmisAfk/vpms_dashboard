// routes/auth.js
const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");

const router = express.Router();

const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const { register, login, me, updateMe } = require("../controllers/authController");
const { ROLES } = require("../utils/constants");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

router.post(
  "/register",
  authLimiter,
  auth,
  roleCheck([ROLES.ADMIN]),
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
    body("role").optional().isIn(Object.values(ROLES)),
    body("phone").optional().trim(),
    body("department").optional().trim(),
    body("location").optional().trim(),
  ],
  register,
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail(),
    body("password").notEmpty(),
  ],
  login,
);

router.get("/me", auth, me);

router.put(
  "/me",
  auth,
  [
    body("name").optional().trim().notEmpty(),
    body("phone").optional().trim(),
    body("department").optional().trim(),
    body("location").optional().trim(),
  ],
  updateMe,
);

module.exports = router;
