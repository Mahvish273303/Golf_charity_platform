import api from "./api";

export const signup = async ({ email, password, fullName, charityId, contributionPercentage }) => {
  const res = await api.post("/api/auth/signup", {
    name: fullName,
    email,
    password,
    charityId: charityId || null,
    contributionPercentage: contributionPercentage ?? 10,
  });
  return res.data;
};

export const login = async (email, password) => {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data;
};

export const logout = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
