import { useEffect, useState, type ReactNode } from "react";
import { type authStateType, type ThemeColors } from "../lib/types";
import { AppContext } from "../lib/context";

const THEME_KEY = "theme";

// Wrapper around App.tsx to provide app wide context for various things
// Felt like declaring all of the states here was a bit neater than having everything in App.tsx
export const ContextWrapper = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeColors>("blue");
  const [authState, setAuthState] = useState<authStateType>(null);

  //attempt to get themeColor from localStorage and set it as the ThemeColor
  const storageTheme = localStorage.getItem(THEME_KEY) as ThemeColors | null;
  if (storageTheme) {
    setTheme(storageTheme);
  }

  //Whenever theme state changes, useEffect run to save changes to localStorage
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <AppContext.Provider value={{ theme, setTheme, authState, setAuthState }}>
      {children}
    </AppContext.Provider>
  );
};
