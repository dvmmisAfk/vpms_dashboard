// controllers/authController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const createAuditLog = require("../utils/auditLog");
const { ROLES, AUDIT_ACTIONS } = require("../utils/constants");
const { MESSAGES } = require("../utils/messages");
const { sendIfValidationErrors } = require("../utils/validateRequest");

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id?.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

const register = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return;

    const { name, email, password, role, phone, department, location } = req.body;
    const roleToSave = req.user?.role === ROLES.ADMIN && role ? role : ROLES.EMPLOYEE;
    const existing = await User.findOne({ email }).lean();
    if (existing) return res.status(409).json({ success: false, message: MESSAGES.emailExists });
    const user = await User.create({ name, email, password, role: roleToSave, phone, department, location });
    await createAuditLog({ req, actor: req.user?._id || user._id, action: AUDIT_ACTIONS.USER_REGISTERED, targetModel: "User", targetId: user._id.toString() });
    return res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { return next(error); }
};

const login = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return;
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ success: false, message: MESSAGES.invalidCredentials });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: MESSAGES.invalidCredentials });
    const token = signToken(user);
    const safeUser = await User.findById(user._id).select("-password").lean();
    return res.json({
      success: true,
      token,
      user: {
        ...(safeUser || {}),
        id: safeUser?._id,
      },
    });
  } catch (error) { return next(error); }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();
    return res.json({ success: true, data: { ...(user || {}), id: user?._id } });
  } catch (error) { return next(error); }
};

const updateMe = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return;
    const updated = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select("-password").lean();
    return res.json({ success: true, data: { ...(updated || {}), id: updated?._id } });
  } catch (error) { return next(error); }
};

module.exports = { register, login, me, updateMe };
