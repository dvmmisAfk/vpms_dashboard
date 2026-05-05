// api/appointments.js
import api from "./client.js";

export const listAppointments = async (params) => {
  const { data } = await api.get("/appointments", { params });
  return data.data;
};

export const getAppointment = async (id) => {
  const { data } = await api.get(`/appointments/${id}`);
  return data.data;
};

export const createAppointment = async (payload) => {
  const { data } = await api.post("/appointments", payload);
  return data.data;
};

export const updateAppointment = async (id, payload) => {
  const { data } = await api.put(`/appointments/${id}`, payload);
  return data.data;
};

export const cancelAppointment = async (id) => {
  const { data } = await api.delete(`/appointments/${id}`);
  return data.data;
};

export const approveAppointment = async (id) => {
  const { data } = await api.post(`/appointments/${id}/approve`);
  return data.data;
};

export const completePreRegistration = async (token, formData) => {
  const { data } = await api.post(`/appointments/${token}/pre-register`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};
