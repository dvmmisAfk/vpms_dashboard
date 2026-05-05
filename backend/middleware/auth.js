// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { MESSAGES } = require("../utils/messages");

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: MESSAGES.unauthorized });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: MESSAGES.unauthorized });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: MESSAGES.unauthorized });
  }
};

module.exports = auth;
