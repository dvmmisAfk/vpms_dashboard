// controllers/appointmentController.js
const jwt = require("jsonwebtoken");
const Appointment = require("../models/Appointment");
const Visitor = require("../models/Visitor");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");
const createAuditLog = require("../utils/auditLog");
const uploadPhotoBuffer = require("../utils/uploadPhotoBuffer");
const { APPOINTMENT_STATUSES, VISITOR_STATUSES, ROLES, AUDIT_ACTIONS } = require("../utils/constants");
const { MESSAGES } = require("../utils/messages");
const { sendIfValidationErrors } = require("../utils/validateRequest");

const createAppointment = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return;

    const hostId = req.body.host || req.user._id;
    const host = await User.findById(hostId).lean();
    if (!host) return res.status(400).json({ success: false, message: MESSAGES.hostNotFound });

    const visitor = await Visitor.create({
      name: req.body.visitorName,
      email: req.body.visitorEmail,
      phone: req.body.visitorPhone,
      company: req.body.company,
      purpose: req.body.purpose,
      host: hostId,
      preRegistered: true,
      status: VISITOR_STATUSES.PENDING,
      location: host.location || req.body.location || "hq",
    });

    const appointment = await Appointment.create({
      visitor: visitor._id,
      host: hostId,
      scheduledAt: req.body.scheduledAt,
      purpose: req.body.purpose,
      notes: req.body.notes,
      status: APPOINTMENT_STATUSES.PENDING,
    });

    const token = jwt.sign({ appointmentId: appointment._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const link = `${process.env.CLIENT_URL}/pre-register/${token}`;

    if (visitor.email) {
      await sendEmail({
        to: visitor.email,
        template: "appointmentConfirmation",
        payload: {
          visitorName: visitor.name,
          scheduledAt: appointment.scheduledAt,
          preRegisterLink: link,
        },
      });
    }

    await sendEmail({
      to: host.email,
      template: "appointmentReminder",
      payload: { visitorName: visitor.name, scheduledAt: appointment.scheduledAt },
    });

    await createAuditLog({
      req,
      actor: req.user._id,
      action: AUDIT_ACTIONS.APPOINTMENT_CREATED,
      targetModel: "Appointment",
      targetId: appointment._id.toString(),
      details: { preRegisterLink: link },
    });

    return res.status(201).json({ success: true, data: { appointment, visitor, preRegisterLink: link } });
  } catch (error) {
    return next(error);
  }
};

const listAppointments = async (req, res, next) => {
  try {
    const { date, status, host } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (host) filter.host = host;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.scheduledAt = { $gte: start, $lt: end };
    }

    if (req.user.role === ROLES.EMPLOYEE) filter.host = req.user._id;
    if (req.user.role === ROLES.SECURITY) {
      const scopedVisitorIds = await Visitor.distinct("_id", { location: req.user.location });
      filter.visitor = { $in: scopedVisitorIds };
    }

    const items = await Appointment.find(filter).populate("visitor host").sort({ scheduledAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (error) {
    return next(error);
  }
};

const getAppointment = async (req, res, next) => {
  try {
    const item = await Appointment.findById(req.params.id).populate("visitor host").lean();
    if (!item) return res.status(404).json({ success: false, message: MESSAGES.appointmentNotFound });
    return res.json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return;
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("visitor host").lean();
    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const cancelled = await Appointment.findByIdAndUpdate(req.params.id, { status: APPOINTMENT_STATUSES.CANCELLED }, { new: true }).lean();
    await createAuditLog({
      req,
      actor: req.user._id,
      action: AUDIT_ACTIONS.APPOINTMENT_CANCELLED,
      targetModel: "Appointment",
      targetId: req.params.id,
    });
    return res.json({ success: true, data: cancelled });
  } catch (error) {
    return next(error);
  }
};

const approveAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate("visitor host").exec();
    if (!appointment) return res.status(404).json({ success: false, message: MESSAGES.appointmentNotFound });

    appointment.status = APPOINTMENT_STATUSES.APPROVED;
    appointment.notificationSent = true;
    await appointment.save();

    await Visitor.findByIdAndUpdate(appointment.visitor._id, { status: VISITOR_STATUSES.APPROVED }).lean();

    if (appointment.visitor.email) {
      await sendEmail({
        to: appointment.visitor.email,
        template: "appointmentApproved",
        payload: { visitorName: appointment.visitor.name, scheduledAt: appointment.scheduledAt },
      });
    }

    if (appointment.visitor.phone) {
      await sendSMS({ to: appointment.visitor.phone, body: MESSAGES.smsAppointmentApprovedVisitor });
    }

    if (appointment.host.phone) {
      await sendSMS({
        to: appointment.host.phone,
        body: `${appointment.visitor.name} ${MESSAGES.smsAppointmentApprovedHostSuffix}`,
      });
    }

    await createAuditLog({
      req,
      actor: req.user._id,
      action: AUDIT_ACTIONS.APPOINTMENT_APPROVED,
      targetModel: "Appointment",
      targetId: appointment._id.toString(),
    });

    return res.json({ success: true, data: appointment.toObject() });
  } catch (error) {
    return next(error);
  }
};

const completePreRegistration = async (req, res, next) => {
  try {
    if (sendIfValidationErrors(req, res)) return;

    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const appointment = await Appointment.findById(decoded.appointmentId).populate("visitor host").exec();

    if (!appointment || appointment.status === APPOINTMENT_STATUSES.CANCELLED) {
      return res.status(404).json({ success: false, message: MESSAGES.appointmentNotFound });
    }

    let photoUrl = appointment.visitor.photoUrl;
    if (req.file) photoUrl = await uploadPhotoBuffer(req.file.buffer);

    appointment.visitor.name = req.body.name || appointment.visitor.name;
    appointment.visitor.phone = req.body.phone || appointment.visitor.phone;
    appointment.visitor.company = req.body.company || appointment.visitor.company;
    appointment.visitor.purpose = req.body.purpose || appointment.visitor.purpose;
    appointment.visitor.photoUrl = photoUrl;
    await appointment.visitor.save();

    await createAuditLog({
      req,
      actor: appointment.host._id,
      action: AUDIT_ACTIONS.APPOINTMENT_PRE_REGISTERED,
      targetModel: "Visitor",
      targetId: appointment.visitor._id.toString(),
    });

    if (appointment.host.email) {
      await sendEmail({
        to: appointment.host.email,
        template: "hostPreRegistrationComplete",
        payload: { visitorName: appointment.visitor.name },
      });
    }

    return res.json({ success: true, data: appointment.toObject() });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createAppointment,
  listAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  approveAppointment,
  completePreRegistration,
};
