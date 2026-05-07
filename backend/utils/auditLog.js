const AuditLog = require('../models/AuditLog')

// just a thin wrapper so controllers don't have to import AuditLog directly
// not sure if abstracting this is worth it but it keeps controllers cleaner
async function createAuditLog({ actor, action, targetModel, targetId, details, ip }) {
  try {
    await AuditLog.create({ actor, action, targetModel, targetId, details, ip })
  } catch (e) {
    console.warn('audit log failed:', e.message)
  }
}

module.exports = createAuditLog
