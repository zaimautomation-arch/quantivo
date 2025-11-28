// components/ThemeProvider.tsx
"use client";

import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: Props) {
  useEffect(() => {
    const stored =
      (typeof window !== "undefined" &&
        (localStorage.getItem("quantivo-theme") as "light" | "dark" | null)) ||
      null;

    const theme = stored || "dark";
    document.documentElement.dataset.theme = theme;
  }, []);

  return <>{children}</>;
}
