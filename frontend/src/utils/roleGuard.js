// utils/roleGuard.js

export const hasAnyRole = (userRole, allowedRoles = []) => allowedRoles.includes(userRole);
