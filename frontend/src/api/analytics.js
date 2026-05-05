// api/analytics.js
import api from "./client.js";

export const fetchAnalyticsSummary = async () => {
  const { data } = await api.get("/analytics/summary");
  return data.data;
};

export const fetchPeakHours = async () => {
  const { data } = await api.get("/analytics/peak-hours");
  return data.data;
};

export const fetchAverageDuration = async () => {
  const { data } = await api.get("/analytics/average-duration");
  return data.data;
};
