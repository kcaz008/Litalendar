"use client";

import { useEffect } from "react";

/** Ensures admin/setup pages can scroll (overrides Echo display body lock). */
export function AdminScrollFix() {
  useEffect(() => {
    document.body.classList.remove("display-locked");
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";

    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, []);

  return null;
}
