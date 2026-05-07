// shared string constants used across controllers and routes
const ROLES = {
  ADMIN: 'admin',
  SECURITY: 'security',
  EMPLOYEE: 'employee',
  VISITOR: 'visitor',
}

const VISITOR_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CHECKED_IN: 'checked-in',
  CHECKED_OUT: 'checked-out',
}

const APPOINTMENT_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
}

module.exports = { ROLES, VISITOR_STATUSES, APPOINTMENT_STATUSES }
