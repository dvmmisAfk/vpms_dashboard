// api/bootstrap.js
import api from "./client.js";

export const bootstrapAdmin = async (payload) => {
  const { data } = await api.post("/bootstrap/admin", payload);
  return data;
};
