import React, { createContext } from "react";
import type { authStateType, ThemeColors } from "./types";

// Types of context, gotten from intellisense hovering lol
export interface AppContextType {
  theme: ThemeColors;
  setTheme: React.Dispatch<React.SetStateAction<ThemeColors>>;
  authState: authStateType;
  setAuthState: React.Dispatch<React.SetStateAction<authStateType>>;
}

// Create the context
export const AppContext = createContext<AppContextType | undefined>(undefined);
