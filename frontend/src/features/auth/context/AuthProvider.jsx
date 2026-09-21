import { useEffect, useMemo, useState } from "react";
import { getMeRequest } from "../api/api";
import { clearToken, getToken, setToken } from "../../../shared/api/tokenStorage";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(getToken()));

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const controller = new AbortController();

    const hydrateSession = async () => {
      try {
        const data = await getMeRequest({ signal: controller.signal });
        setUser(data.user);
      } catch {
        if (controller.signal.aborted) return;
        clearToken();
        setUser(null);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    hydrateSession();

    return () => controller.abort();
  }, []);

  const login = async (data) => {
    setToken(data.token);
    try {
      const me = await getMeRequest();
      setUser(me.user);
    } catch (err) {
      clearToken();
      setUser(null);
      throw err;
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
