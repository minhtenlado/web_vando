"use client";

import { useEffect } from "react";
import { AdminApp } from "@/components/admin/admin-app";

export default function AdminPage() {
  useEffect(() => {
    document.title = "Admin Panel — Phan Huỳnh Văn Đô";
  }, []);
  return <AdminApp />;
}
