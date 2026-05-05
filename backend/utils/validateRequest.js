// utils/validateRequest.js
const { validationResult } = require("express-validator");

function sendIfValidationErrors(req, res) {
  const result = validationResult(req);
  if (result.isEmpty()) return false;
  res.status(400).json({ success: false, errors: result.array() });
  return true;
}

module.exports = { sendIfValidationErrors };
