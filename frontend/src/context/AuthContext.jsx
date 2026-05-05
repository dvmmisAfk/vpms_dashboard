// context/AuthContext.jsx
import PropTypes from "prop-types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { fetchMe, loginUser } from "../api/auth.js";
import api, { tokenStorageKey } from "../api/client.js";
import { ROLES } from "../utils/constants.js";

const AuthContext = createContext(null);

function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    let base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizeUser(raw) {
  if (!raw) return null;
  const id = raw.id ?? raw._id;
  return {
    ...raw,
    id: id != null ? String(id) : undefined,
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(tokenStorageKey) || "");
  const [profile, setProfile] = useState(null);

  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem(tokenStorageKey)) return null;
    const me = normalizeUser(await fetchMe());
    setProfile(me);
    return me;
  }, []);

  useEffect(() => {
    const existing = localStorage.getItem(tokenStorageKey) || "";
    setToken(existing);
    if (existing) {
      api.defaults.headers.common.Authorization = `Bearer ${existing}`;
      refreshProfile().catch(() => {
        /* non-fatal: user might be stale */
      });
    }
  }, [refreshProfile]);

  const claimsUser = useMemo(() => {
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (!payload?.id) return null;
    return {
      id: String(payload.id),
      role: payload.role,
      name: payload.name,
      email: payload.email,
    };
  }, [token]);

  const user = profile || claimsUser;
  const isAuthenticated = Boolean(token && user?.role && user?.id);

  const login = useCallback(
    async ({ email, password }) => {
      const res = await loginUser({ email, password });
      const nextToken = res.token;
      if (!nextToken) throw new Error("Missing token");

      localStorage.setItem(tokenStorageKey, nextToken);
      setToken(nextToken);
      api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;

      const fromLogin = normalizeUser(res.user);
      setProfile(fromLogin);
      try {
        const refreshed = await fetchMe();
        const next = normalizeUser(refreshed);
        if (next?.id && next.role) setProfile(next);
      } catch {
        localStorage.setItem(tokenStorageKey, nextToken);
        api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
      }

      return fromLogin;
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(tokenStorageKey);
    delete api.defaults.headers.common.Authorization;
    setToken("");
    setProfile(null);
  }, []);

  const hasRole = useCallback(
    (role) => {
      if (!user?.role) return false;
      return user.role === role;
    },
    [user?.role],
  );

  const hasAnyRole = useCallback(
    (roles = []) => {
      if (!user?.role) return false;
      return roles.includes(user.role);
    },
    [user?.role],
  );

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      login,
      logout,
      refreshProfile,
      hasRole,
      hasAnyRole,
      roles: ROLES,
    }),
    [token, user, isAuthenticated, login, logout, refreshProfile, hasRole, hasAnyRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
