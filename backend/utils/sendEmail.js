// utils/sendEmail.js
const emailTransport = require("../config/email");

const templates = {
  appointmentConfirmation: ({ visitorName, scheduledAt, preRegisterLink }) => ({
    subject: "Appointment Confirmation - VPMS",
    html: `<p>Hello ${visitorName}, your appointment is scheduled for ${scheduledAt}.</p>${
      preRegisterLink ? `<p>Complete your pre-registration here: <a href="${preRegisterLink}">${preRegisterLink}</a></p>` : ""
    }`,
  }),
  passIssued: ({ visitorName, passCode, pdfUrl }) => ({
    subject: "Your Visitor Pass - VPMS",
    html: `<p>Hello ${visitorName}, your pass code is <b>${passCode}</b>. <a href="${pdfUrl}">Download PDF</a></p>`,
  }),
  appointmentReminder: ({ visitorName, scheduledAt }) => ({
    subject: "Appointment Reminder - VPMS",
    html: `<p>Reminder for ${visitorName}: appointment at ${scheduledAt}.</p>`,
  }),
  appointmentApproved: ({ visitorName, scheduledAt }) => ({
    subject: "Appointment Approved - VPMS",
    html: `<p>Hello ${visitorName}, your appointment on ${scheduledAt} has been approved.</p>`,
  }),
  hostPreRegistrationComplete: ({ visitorName }) => ({
    subject: "Visitor Completed Pre-registration - VPMS",
    html: `<p>${visitorName} has completed pre-registration.</p>`,
  }),
};

const sendEmail = async ({ to, template, payload }) => {
  if (!to) return null;
  const msg = templates[template](payload);
  return emailTransport.sendMail({ from: process.env.EMAIL_USER, to, ...msg });
};

module.exports = sendEmail;
