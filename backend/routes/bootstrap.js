// routes/bootstrap.js
const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const { createInitialAdmin } = require("../controllers/bootstrapController");

router.post(
  "/admin",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 12 }),
    body("phone").optional().trim(),
    body("department").optional().trim(),
    body("location").optional().trim(),
  ],
  createInitialAdmin,
);

module.exports = router;
