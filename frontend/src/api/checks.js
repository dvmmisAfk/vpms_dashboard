// api/checks.js
import api from "./client.js";

export const checkIn = async (payload) => {
  const { data } = await api.post("/checks/check-in", payload);
  return data.data;
};

export const checkOut = async (payload) => {
  const { data } = await api.post("/checks/check-out", payload);
  return data.data;
};

export const listCheckLogs = async (params) => {
  const { data } = await api.get("/checks/logs", { params });
  return data.data;
};
