"use client";

import * as React from "react";
import { Activity } from "lucide-react";

export function ActivityLogTab() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center rounded-xl border border-border bg-card/40 mt-8">
      <Activity className="size-10 text-muted-foreground/30 animate-pulse" />
      <div>
        <p className="font-medium text-sm text-foreground">Activity Log</p>
        <p className="text-xs text-muted-foreground mt-1">
          Lịch sử hoạt động sẽ xuất hiện ở đây...
        </p>
      </div>
    </div>
  );
}
