// api/dashboard.js
import api from "./client.js";

export const fetchDashboardStats = async () => {
  const { data } = await api.get("/dashboard/stats");
  return data.data;
};

export const fetchRecentCheckIns = async () => {
  const { data } = await api.get("/dashboard/recent");
  return data.data;
};

export const exportVisitorsCsv = async () => {
  const res = await api.get("/dashboard/export", { responseType: "blob" });
  return res.data;
};
