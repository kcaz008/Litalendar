"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Keeps admin/setup pages scrollable and clickable (Echo display locks body separately). */
export function BodyScrollGuard() {
  const pathname = usePathname();
  const isDisplayRoute = pathname.startsWith("/display/");

  useEffect(() => {
    if (isDisplayRoute) return;

    document.body.classList.remove("display-locked");
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    document.body.style.pointerEvents = "auto";
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";

    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.pointerEvents = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, [isDisplayRoute]);

  return null;
}
