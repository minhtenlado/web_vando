"use client";

import * as React from "react";
import { Settings } from "lucide-react";

export function SettingsTab() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center rounded-xl border border-border bg-card/40 mt-8">
      <Settings className="size-10 text-muted-foreground/30 animate-[spin_4s_linear_infinite]" />
      <div>
        <p className="font-medium text-sm text-foreground">Cài đặt hệ thống</p>
        <p className="text-xs text-muted-foreground mt-1">
          Tính năng đang được phát triển...
        </p>
      </div>
    </div>
  );
}
