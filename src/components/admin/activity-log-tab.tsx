"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";

type ActivityLog = {
  id: string;
  category: string;
  action: string;
  title: string;
  detail: string | null;
  resource: string | null;
  user: string | null;
  status: string;
  createdAt: string;
};

export function ActivityLogTab() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [period, setPeriod] = useState("30");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/activities");
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClearOldLogs = async () => {
    if (!confirm("Are you sure you want to clear logs older than 30 days?")) return;
    try {
      const res = await fetch("/api/admin/activities", { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        alert(`Cleared ${json.count} old logs.`);
        fetchLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    let filtered = logs;
    
    // Category filter
    if (filter !== "all") {
      filtered = filtered.filter(l => l.category.toLowerCase() === filter);
    }
    
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(q) || 
        (l.detail && l.detail.toLowerCase().includes(q)) ||
        (l.resource && l.resource.toLowerCase().includes(q)) ||
        (l.user && l.user.toLowerCase().includes(q))
      );
    }

    // Period filter
    const now = new Date();
    filtered = filtered.filter(l => {
      if (period === "all") return true;
      const logDate = new Date(l.createdAt);
      if (period === "today") {
        return logDate.toDateString() === now.toDateString();
      } else {
        const days = parseInt(period);
        const diffTime = Math.abs(now.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= days;
      }
    });

    return filtered;
  }, [logs, search, filter, period]);

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "activity_logs.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const getEventIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "create": return "+";
      case "update": return "✎";
      case "delete": return "×";
      case "login": return "→";
      case "upload": return "↑";
      case "failed": return "!";
      case "settings": return "⚙";
      case "backup": return "↓";
      default: return "•";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "success": return "success";
      case "failed":
      case "error": return "danger";
      case "warning": return "warning";
      default: return "";
    }
  };

  const totalEvents = filteredLogs.length;
  const successEvents = filteredLogs.filter(l => l.status.toLowerCase() === "success").length;
  const warningEvents = filteredLogs.filter(l => l.status.toLowerCase() === "warning").length;
  const failedEvents = filteredLogs.filter(l => l.status.toLowerCase() === "failed" || l.status.toLowerCase() === "error").length;

  return (
    <div className="admin-view" data-view-panel="activity" id="activityView">
      <div className="system-page-header">
        <div>
          <div className="page-kicker">
            <span></span>
            SYSTEM / ACTIVITY
          </div>
          <h1 className="page-title">Activity Log</h1>
          <p className="page-description">
            Theo dõi các thay đổi, đăng nhập, bảo mật, media và hoạt động hệ thống.
          </p>
        </div>
        <div className="activity-header-actions">
          <button className="top-button" id="exportLogsBtn" onClick={handleExport}>
            ↓ Export log
          </button>
          <button className="top-button" id="clearOldLogsBtn" onClick={handleClearOldLogs}>
            清 Clear old logs
          </button>
        </div>
      </div>

      <div className="overview activity-overview">
        <div className="stat">
          <div className="stat-label">TOTAL EVENTS</div>
          <div className="stat-number">{totalEvents.toString().padStart(2, '0')}</div>
          <div className="stat-note">trong kỳ</div>
        </div>
        <div className="stat">
          <div className="stat-label">SUCCESS</div>
          <div className="stat-number green">{successEvents.toString().padStart(2, '0')}</div>
          <div className="stat-note">successful actions</div>
        </div>
        <div className="stat">
          <div className="stat-label">WARNINGS</div>
          <div className="stat-number">{warningEvents.toString().padStart(2, '0')}</div>
          <div className="stat-note">cần kiểm tra</div>
        </div>
        <div className="stat">
          <div className="stat-label">FAILED</div>
          <div className="stat-number" style={{ color: "#ff7474" }}>
            {failedEvents.toString().padStart(2, '0')}
          </div>
          <div className="stat-note">failed events</div>
        </div>
      </div>

      <div className="activity-toolbar-pro">
        <div className="activity-search-pro">
          <span>⌕</span>
          <input
            id="activitySearch"
            type="text"
            placeholder="Tìm event, resource, user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="activity-filter-group">
          {["all", "content", "auth", "security", "system", "media"].map((f) => (
            <button
              key={f}
              className={`activity-filter-pro ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Tất cả" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <select
          className="activity-period-pro"
          id="activityPeriod"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="today">Hôm nay</option>
          <option value="7">7 ngày</option>
          <option value="30">30 ngày</option>
          <option value="all">Tất cả</option>
        </select>
      </div>

      <div className="activity-log-pro" id="activityLogList">
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#60736b" }}>Loading logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#60736b" }}>No activity logs found.</div>
        ) : (
          filteredLogs.map((log) => {
            const date = new Date(log.createdAt);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            
            return (
              <article key={log.id} className="activity-log-row" data-category={log.category.toLowerCase()}>
                <div className="activity-log-time">
                  <strong>{timeStr}</strong>
                  <span>{dateStr}</span>
                </div>
                <div className={`activity-log-event ${log.action.toLowerCase()}`}>
                  <div className="activity-event-icon">{getEventIcon(log.action)}</div>
                  <div>
                    <strong>{log.title}</strong>
                    <span>{log.detail}</span>
                  </div>
                </div>
                <div className="activity-log-resource">
                  {log.resource}
                </div>
                <div className="activity-log-user">
                  <span>{log.user ? log.user.substring(0, 2).toUpperCase() : "?"}</span>
                  {log.user || "Unknown"}
                </div>
                <div className={`activity-log-status ${getStatusClass(log.status)}`}>
                  {log.status.toUpperCase()}
                </div>
                <button className="activity-more">⋮</button>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
