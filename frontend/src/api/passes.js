// api/passes.js
import api from "./client.js";

export const generatePass = async (visitorId, payload) => {
  const { data } = await api.post(`/passes/generate/${visitorId}`, payload);
  return data.data;
};

export const listPasses = async () => {
  const { data } = await api.get("/passes");
  return data.data;
};

export const getPass = async (id) => {
  const { data } = await api.get(`/passes/${id}`);
  return data.data;
};

export const verifyPassCode = async (passCode) => {
  const { data } = await api.get(`/passes/verify/${passCode}`);
  return data.data;
};

export const deactivatePass = async (id) => {
  const { data } = await api.put(`/passes/${id}/deactivate`);
  return data.data;
};

export const fetchMyPass = async () => {
  const { data } = await api.get("/passes/my");
  return data.data;
};
