// api/auth.js
import api from "./client.js";

export const loginUser = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const fetchMe = async () => {
  const { data } = await api.get("/auth/me");
  return data.data;
};

export const updateMe = async (payload) => {
  const { data } = await api.put("/auth/me", payload);
  return data.data;
};

export const registerUser = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};
