// utils/sendSMS.js
const smsClient = require("../config/sms");

const sendSMS = async ({ to, body }) => {
  if (!to || !process.env.TWILIO_PHONE) return null;
  return smsClient.messages.create({
    from: process.env.TWILIO_PHONE,
    to,
    body,
  });
};

module.exports = sendSMS;
