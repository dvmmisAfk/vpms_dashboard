// config/sms.js
const twilio = require("twilio");

const smsClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || "",
  process.env.TWILIO_AUTH_TOKEN || "",
);

module.exports = smsClient;
