const PDFDocument = require('pdfkit')
const cloudinary = require('../config/cloudinary')

// generates a visitor badge PDF and uploads it to cloudinary
// returns the cloudinary url, or null if something goes wrong
// the stream stuff took me a while to understand - pdfkit gives you chunks and you have to join them
function generatePDF(options) {
  const visitor = options.visitor
  const hostName = options.hostName
  const passCode = options.passCode
  const validFrom = options.validFrom
  const validUntil = options.validUntil
  const qrCodeData = options.qrCodeData

  return new Promise(function(resolve, reject) {
    console.log('generating pdf for:', visitor.name)

    const doc = new PDFDocument({ size: 'A6', margin: 18 })

    // collect the pdf data chunks as they come
    const chunks = []

    doc.on('data', function(chunk) {
      chunks.push(chunk)
    })

    doc.on('error', function(err) {
      console.log('pdfkit error:', err.message)
      reject(err)
    })

    // when pdf is fully built, upload it to cloudinary
    doc.on('end', function() {
      const pdfBuffer = Buffer.concat(chunks)

      // cloudinary stream upload - different from normal upload, took me a while to figure out
      // basically you create a write stream and pipe the buffer into it
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'vpms/passes',
          public_id: 'pass-' + passCode
        },
        function(uploadErr, result) {
          if (uploadErr) {
            // if upload fails, just return null - pass still works without pdf
            console.log('cloudinary upload failed:', uploadErr.message)
            resolve(null)
            return
          }
          console.log('pdf uploaded, url:', result.secure_url)
          resolve(result.secure_url)
        }
      )

      uploadStream.end(pdfBuffer)
    })

    // now actually build the pdf content
    doc.fontSize(16).text('VISITOR PASS', { align: 'center' })
    doc.moveDown(0.8)
    doc.fontSize(11).text('Name: ' + visitor.name)
    doc.text('Company: ' + (visitor.company || 'N/A'))
    doc.text('Host: ' + (hostName || 'N/A'))
    doc.text('Pass Code: ' + passCode)

    if (validFrom) {
      doc.text('Valid From: ' + new Date(validFrom).toLocaleString())
    }
    if (validUntil) {
      doc.text('Valid Until: ' + new Date(validUntil).toLocaleString())
    }

    // add qr code image if we have one
    // qrCodeData is a base64 data URL like "data:image/png;base64,abc123..."
    if (qrCodeData) {
      try {
        const base64Part = qrCodeData.split(',')[1]
        const imgBuffer = Buffer.from(base64Part, 'base64')
        doc.moveDown(0.6)
        doc.image(imgBuffer, { fit: [120, 120], align: 'center' })
      } catch (e) {
        // dont crash if qr image embedding fails
        console.log('couldnt embed qr in pdf:', e.message)
      }
    }

    // finalize the pdf - this triggers the 'end' event above
    doc.end()
  })
}

module.exports = generatePDF
