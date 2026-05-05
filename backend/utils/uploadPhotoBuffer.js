// utils/uploadPhotoBuffer.js
const cloudinary = require("../config/cloudinary");

function uploadPhotoBuffer(buffer, folder = "vpms/visitors") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
    stream.end(buffer);
  });
}

module.exports = uploadPhotoBuffer;
