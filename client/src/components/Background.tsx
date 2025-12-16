import type { ReactNode } from "react";
import wallpaperUrl from "./../assets/wallpaper.svg";
import { useLocation } from "react-router";
import { useGetContext } from "../lib/helper";

//pages to skip
const skipPages = ["/signup", "/login", "/"];

export function Background({ children }: { children: ReactNode }) {
  const path = useLocation().pathname;
  const context = useGetContext();
  const themeColor = context.theme;

  const skipBackground = skipPages.includes(path);
  if (skipBackground) return <>{children}</>;

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center"
      style={{
        backgroundImage: `url(${wallpaperUrl})`,
        backgroundColor: themeColor,
        backgroundBlendMode: "multiply",
      }}
    >
      {children}
    </div>
  );
}
