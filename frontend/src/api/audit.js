// api/audit.js
import api from "./client.js";

export const listAuditLogs = async (params) => {
  const { data } = await api.get("/audit-logs", { params });
  return data.data;
};
