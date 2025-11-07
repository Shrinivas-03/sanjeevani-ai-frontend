import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform, useColorScheme as useRNColorScheme } from "react-native";

export type AppTheme = "light" | "dark";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useRNColorScheme() ?? "light";

  const [theme, setThemeState] = useState<AppTheme>(system);

  useEffect(() => {
    const getTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem("app-theme");
        if (stored === "light" || stored === "dark") {
          setThemeState(stored);
        }
      } catch (e) {
        console.warn("Failed to load theme from storage", e);
      }
    };
    getTheme();
  }, []);

  useEffect(() => {
    const setTheme = async () => {
      try {
        await AsyncStorage.setItem("app-theme", theme);
      } catch (e) {
        console.warn("Failed to save theme to storage", e);
      }
    };
    setTheme();
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (t: AppTheme) => {
        console.log("Setting theme to:", t);
        setThemeState(t);
      },
      toggleTheme: () => {
        console.log("Toggling theme from:", theme);
        setThemeState((prev) => (prev === "light" ? "dark" : "light"));
      },
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback: if provider not mounted yet, use system
    const system = useRNColorScheme() ?? "light";
    return {
      theme: system as AppTheme,
      setTheme: () => {},
      toggleTheme: () => {},
    } satisfies ThemeContextValue;
  }
  return ctx;
}
