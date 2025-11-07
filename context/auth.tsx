import { clearTokens } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type User = {
  id?: string | number;
  email?: string;
  full_name?: string;
  name?: string;
  [key: string]: any;
};

export type AuthContextValue = {
  isAuthenticated: boolean;
  user?: User | null;
  loading: boolean;
  login: (user?: User) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
  onLogout,
}: {
  children: React.ReactNode;
  onLogout?: () => void;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, _setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadState = async () => {
      try {
        const auth = await AsyncStorage.getItem("isAuthenticated");
        const storedUser = await AsyncStorage.getItem("user");
        if (auth === "true") {
          setIsAuthenticated(true);
          if (storedUser) {
            _setUser(JSON.parse(storedUser));
          }
        }
      } catch (e) {
        console.error("Failed to load auth state", e);
      } finally {
        setLoading(false);
      }
    };
    loadState();
  }, []);

  const login = useCallback(async (user?: User) => {
    setIsAuthenticated(true);
    if (user) {
      _setUser(user);
      await AsyncStorage.setItem("user", JSON.stringify(user));
    }
    await AsyncStorage.setItem("isAuthenticated", "true");
  }, []);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    _setUser(null);
    await clearTokens();
    await AsyncStorage.removeItem("isAuthenticated");
    await AsyncStorage.removeItem("user");
    onLogout?.();
  }, [onLogout]);

  const setUser = useCallback(async (user: User | null) => {
    _setUser(user);
    if (user) {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem("user");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      user,
      loading,
      login,
      logout,
      setUser,
    }),
    [isAuthenticated, user, loading, login, logout, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      isAuthenticated: false,
      user: null,
      loading: false,
      login: async () => {},
      logout: () => {},
      setUser: () => {},
    } satisfies AuthContextValue as AuthContextValue;
  }
  return ctx;
}
