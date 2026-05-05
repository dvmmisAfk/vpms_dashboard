// middleware/roleCheck.js
const { MESSAGES } = require("../utils/messages");

const roleCheck = (roles = []) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: MESSAGES.forbidden });
  }
  return next();
};

module.exports = roleCheck;
