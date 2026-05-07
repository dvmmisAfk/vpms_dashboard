// controllers/bootstrapController.js
const User = require("../models/User");
const { ROLES } = require("../utils/constants");
const AuditLog = require("../models/AuditLog");
const { MESSAGES } = require("../utils/messages");
const { sendIfValidationErrors } = require("../utils/validateRequest");

const createInitialAdmin = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return;

    const adminCount = await User.countDocuments({ role: ROLES.ADMIN });

    if (adminCount > 0) return res.status(403).json({ success: false, message: MESSAGES.bootstrapAdminExists });

    const normalizedEmail = String(req.body.email || "").trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) return res.status(409).json({ success: false, message: MESSAGES.emailExists });

    const admin = await User.create({
      name: req.body.name,
      email: normalizedEmail,
      password: req.body.password,
      role: ROLES.ADMIN,
      phone: req.body.phone,
      department: req.body.department,
      location: req.body.location || "hq",
      isActive: true,
    });

    AuditLog.create({ actor: admin._id, action: 'bootstrap-admin', targetModel: 'User', targetId: admin._id.toString(), ip: req.ip }).catch(e => console.warn('audit log failed:', e.message));

    return res.status(201).json({ success: true, data: { id: admin._id, email: admin.email, role: admin.role } });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: MESSAGES.emailExists });
    }
    return next(error);
  }
};

module.exports = { createInitialAdmin };
