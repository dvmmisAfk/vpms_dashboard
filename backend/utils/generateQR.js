// utils/generateQR.js
const QRCode = require("qrcode");

const generateQR = async (passCode) => {
  const dataUrl = await QRCode.toDataURL(passCode, { width: 300, margin: 2 });
  return dataUrl;
};

module.exports = generateQR;
