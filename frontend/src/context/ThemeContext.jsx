// context/ThemeContext.jsx
import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "vpms_dark_mode";

const ThemeContext = createContext({
  theme: "light",
  setDarkMode: () => {},
});

const decodeStoredPreference = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export function ThemeProvider({ children }) {
  const [darkMode, setDarkModeState] = useState(() => decodeStoredPreference() === "true");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem(STORAGE_KEY, darkMode ? "true" : "false");
    } catch {
      /* ignore storage failures */
    }
  }, [darkMode]);

  const value = useMemo(() => {
    const toggleDarkMode = () => setDarkModeState((prev) => !prev);
    const setDarkMode = (next) => setDarkModeState(Boolean(next));
    return { theme: darkMode ? "dark" : "light", toggleDarkMode, setDarkMode };
  }, [darkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useTheme() {
  return useContext(ThemeContext);
}
