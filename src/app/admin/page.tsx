"use client";

import { useEffect } from "react";
import { AdminApp } from "@/components/admin/admin-app";
import { LocaleProvider } from "@/components/cv/locale-context";

export default function AdminPage() {
  useEffect(() => {
    document.title = "Engineering Lab — Control Center";
  }, []);
  return (
    <LocaleProvider>
      <AdminApp />
    </LocaleProvider>
  );
}
