import { useEffect, useState, type ReactNode } from "react";
import { type authStateType, type ThemeColors } from "../lib/types";
import { AppContext } from "../lib/context";
import { WEBSITE_URL } from "../lib/assets";

const THEME_KEY = "theme";
const DEFAULT_THEME: ThemeColors = "blue";

//checks is a proper themeColor

function getInitialTheme(): ThemeColors {
  const storageTheme = localStorage.getItem(THEME_KEY) as ThemeColors | null;
  if (storageTheme === null) return DEFAULT_THEME;
  return storageTheme;
}

// Wrapper around App.tsx to provide app wide context for various things
// Felt like declaring all of the states here was a bit neater than having everything in App.tsx
export const ContextWrapper = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeColors>(getInitialTheme);
  const [authState, setAuthState] = useState<authStateType>("loading");

  async function getLoginState() {
    const res = await fetch(`${WEBSITE_URL}/profile`, {
      credentials: "include",
    });
    if (res.status === 401) {
      setAuthState(null);
      return;
    }
    if (res.ok) {
      const resJson = await res.json();
      if (resJson.data.first_name) setAuthState("FullUser");
    }
  }

  //Whenever theme state changes, useEffect run to save changes to localStorage
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  //check if the user is logged in or not by checking /profile
  useEffect(() => {
    getLoginState();
  }, []);

  return (
    <AppContext.Provider value={{ theme, setTheme, authState, setAuthState }}>
      {children}
    </AppContext.Provider>
  );
};
