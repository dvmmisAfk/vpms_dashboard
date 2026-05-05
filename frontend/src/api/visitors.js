// api/visitors.js
import api from "./client.js";

export const listVisitors = async (params) => {
  const { data } = await api.get("/visitors", { params });
  return data;
};

export const getVisitor = async (id) => {
  const { data } = await api.get(`/visitors/${id}`);
  return data.data;
};

export const createVisitor = async (formData) => {
  const { data } = await api.post("/visitors", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

export const updateVisitor = async (id, payload) => {
  const { data } = await api.put(`/visitors/${id}`, payload);
  return data.data;
};

export const deleteVisitor = async (id) => {
  const { data } = await api.delete(`/visitors/${id}`);
  return data.data;
};

export const approveVisitor = async (id) => {
  const { data } = await api.put(`/visitors/${id}/approve`);
  return data.data;
};

export const rejectVisitor = async (id) => {
  const { data } = await api.put(`/visitors/${id}/reject`);
  return data.data;
};
