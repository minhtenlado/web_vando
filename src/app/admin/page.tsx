"use client";

import { useEffect } from "react";
import { AdminApp } from "@/components/admin/admin-app";
import { LocaleProvider } from "@/components/cv/locale-context";

export default function AdminPage() {
  useEffect(() => {
    document.title = "Engineering Lab — Control Center";
    // The CMS is designed for the dark theme; a light public-site preference must not restyle it.
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.add("dark");
    root.style.colorScheme = "dark";
    return () => {
      if (!wasDark) {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      }
    };
  }, []);
  return (
    <LocaleProvider>
      <AdminApp />
    </LocaleProvider>
  );
}
