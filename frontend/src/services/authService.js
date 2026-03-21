import api from "./api";

export async function signup(payload) {
  const response = await api.post("/api/auth/signup", payload);
  return response.data;
}

export async function login(payload) {
  const response = await api.post("/api/auth/login", payload);
  return response.data;
}
