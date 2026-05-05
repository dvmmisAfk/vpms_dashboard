// utils/generatePDF.js
const PDFDocument = require("pdfkit");
const cloudinary = require("../config/cloudinary");

const uploadBufferToCloudinary = (buffer, publicId) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder: "vpms/passes", public_id: publicId },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(buffer);
  });

const generatePDF = async ({ visitor, hostName, passCode, validFrom, validUntil, qrCodeData }) => {
  const doc = new PDFDocument({ size: "A6", margin: 18 });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  doc.fontSize(16).text("Visitor Pass", { align: "center" });
  doc.moveDown(0.8);
  doc.fontSize(12).text(`Name: ${visitor.name}`);
  doc.text(`Company: ${visitor.company || "N/A"}`);
  doc.text(`Host: ${hostName || "N/A"}`);
  doc.text(`Pass Code: ${passCode}`);
  doc.text(`Valid From: ${new Date(validFrom).toLocaleString()}`);
  doc.text(`Valid Until: ${new Date(validUntil).toLocaleString()}`);
  if (qrCodeData) {
    doc.moveDown(0.6);
    doc.image(Buffer.from(qrCodeData.split(",")[1], "base64"), { fit: [120, 120], align: "center" });
  }
  doc.end();

  const buffer = await new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const uploadRes = await uploadBufferToCloudinary(buffer, `pass-${passCode}`);
  return uploadRes.secure_url;
};

module.exports = generatePDF;
