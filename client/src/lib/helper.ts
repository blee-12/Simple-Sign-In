import { useContext } from "react";
import { AppContext } from "./context";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function validationWrapper<T>(
  validator: (value: any) => T,
  value: any,
  errors: string[]
): T | undefined {
  try {
    return validator(value);
  } catch (err) {
    if (err instanceof Error) {
      errors.push(err.message);
    } else {
      errors.push("Unknown Error in form input!");
    }
    return undefined;
  }
}

//custom react hook to get context and verify that it exists
export function useGetContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("Unable to access App Context!");
  }
  return context;
}

//set user login state
export function useLoginState() {
  const context = useGetContext();
  return context.setAuthState;
}

//set theme color
export function useThemeColor() {
  const context = useGetContext();
  return context.setTheme;
}


