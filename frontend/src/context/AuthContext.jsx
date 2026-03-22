/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signup as signupService, login as loginService, logout as logoutService } from "../services/authService";
import api from "../services/api";

const AuthContext = createContext(null);

// ── Fetch app-level profile (role, charityId, etc.) from backend ─────────────
async function loadProfile(accessToken) {
  try {
    const res = await api.get("/api/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data?.user || null;
  } catch (err) {
    console.error("[AuthContext] loadProfile failed:", err?.response?.data?.message || err.message);
    return null;
  }
}

function persistSession(accessToken, profile, setToken, setUser) {
  localStorage.setItem("token", accessToken);
  localStorage.setItem("user", JSON.stringify(profile));
  setToken(accessToken);
  setUser(profile);
}

function clearSession(setToken, setUser) {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setToken("");
  setUser(null);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem("user");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Restore session on page load
  useEffect(() => {
    const restore = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const profile = await loadProfile(storedToken);
        if (profile) {
          persistSession(storedToken, profile, setToken, setUser);
        } else {
          clearSession(setToken, setUser);
        }
      } else {
        clearSession(setToken, setUser);
      }
      setInitializing(false);
    };
    restore();

    return undefined;
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginService(email, password);
      const accessToken = data.token;
      const profile = data.user || (await loadProfile(accessToken));
      if (!profile) throw new Error("Profile not found. Please contact support.");
      const normalizedProfile = { ...profile, role: data.role || profile.role || "USER" };
      persistSession(accessToken, normalizedProfile, setToken, setUser);
      return normalizedProfile;
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ fullName, email, password, charityId, contributionPercentage }) => {
    setLoading(true);
    try {
      const data = await signupService({
        email,
        password,
        fullName,
        charityId,
        contributionPercentage,
      });
      const accessToken = data.token;
      const profile = data.user || (await loadProfile(accessToken));
      persistSession(accessToken, profile, setToken, setUser);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } finally {
      clearSession(setToken, setUser);
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading: loading || initializing,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === "ADMIN",
      login,
      signup,
      logout,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, user, loading, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
