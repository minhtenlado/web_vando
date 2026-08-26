"use client";

import * as React from "react";
import {
  Mail,
  MailOpen,
  Star,
  StarOff,
  Archive,
  ArchiveRestore,
  Trash2,
  RefreshCw,
  Inbox,
  Filter,
  ChevronDown,
  Clock,
  User,
  AtSign,
  Tag,
  ArrowLeft,
  CheckCheck,
} from "lucide-react";

type ContactMsg = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  ticket: string;
  read: boolean;
  starred: boolean;
  archived: boolean;
  createdAt: string;
};

type Stats = {
  total: number;
  unread: number;
  starred: number;
  archived: number;
};

type FilterType = "all" | "unread" | "starred" | "archived";

export function InboxTab() {
  const [messages, setMessages] = React.useState<ContactMsg[]>([]);
  const [stats, setStats] = React.useState<Stats>({ total: 0, unread: 0, starred: 0, archived: 0 });
  const [filter, setFilter] = React.useState<FilterType>("all");
  const [loading, setLoading] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const fetchMessages = React.useCallback(async (f?: FilterType) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/messages?filter=${f || filter}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setStats(data.stats || { total: 0, unread: 0, starred: 0, archived: 0 });
    } catch {
      console.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleAction = async (action: string, ids: string[]) => {
    try {
      await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      if (action === "delete" || action === "archive") {
        if (ids.includes(selectedId || "")) setSelectedId(null);
      }
      setSelectedIds(new Set());
      fetchMessages();
    } catch {
      console.error("Action failed");
    }
  };

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    setSelectedId(null);
    setSelectedIds(new Set());
    fetchMessages(f);
  };

  const selectedMsg = messages.find((m) => m.id === selectedId);

  // Auto-mark as read when viewing
  React.useEffect(() => {
    if (selectedMsg && !selectedMsg.read) {
      handleAction("read", [selectedMsg.id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map((m) => m.id)));
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filterTabs: { id: FilterType; label: string; count: number; icon: React.ReactNode }[] = [
    { id: "all", label: "Tất cả", count: stats.total, icon: <Inbox className="w-3.5 h-3.5" /> },
    { id: "unread", label: "Chưa đọc", count: stats.unread, icon: <Mail className="w-3.5 h-3.5" /> },
    { id: "starred", label: "Đánh dấu", count: stats.starred, icon: <Star className="w-3.5 h-3.5" /> },
    { id: "archived", label: "Lưu trữ", count: stats.archived, icon: <Archive className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Hộp thư liên hệ
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats.unread > 0
              ? `${stats.unread} tin nhắn chưa đọc trong tổng số ${stats.total}`
              : `Tổng cộng ${stats.total} tin nhắn`}
          </p>
        </div>
        <button
          onClick={() => fetchMessages()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl mb-4 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleFilterChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              filter === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                filter === tab.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-xl mb-3 text-xs">
          <span className="text-primary font-semibold">{selectedIds.size} đã chọn</span>
          <span className="mx-1 text-border">|</span>
          <button onClick={() => handleAction("read", [...selectedIds])} className="hover:text-primary transition-colors flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5" /> Đọc
          </button>
          <button onClick={() => handleAction("archive", [...selectedIds])} className="hover:text-primary transition-colors flex items-center gap-1">
            <Archive className="w-3.5 h-3.5" /> Lưu trữ
          </button>
          <button onClick={() => handleAction("delete", [...selectedIds])} className="hover:text-rose-500 transition-colors flex items-center gap-1 ml-auto">
            <Trash2 className="w-3.5 h-3.5" /> Xóa
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-0 border border-border rounded-xl overflow-hidden bg-card min-h-[500px]">
        {/* Message List */}
        <div className={`${selectedId ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-[380px] xl:w-[420px] lg:border-r border-border`}>
          {/* Select All Header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={messages.length > 0 && selectedIds.size === messages.length}
              onChange={toggleSelectAll}
              className="accent-primary rounded"
            />
            <span>Chọn tất cả</span>
            <span className="ml-auto font-mono">{messages.length} tin</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Đang tải...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-2">
                <Inbox className="w-10 h-10 opacity-30" />
                <p className="text-sm">Không có tin nhắn nào</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => setSelectedId(msg.id)}
                  className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedId === msg.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  } ${!msg.read ? "bg-primary/[0.02]" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(msg.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(msg.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="accent-primary rounded mt-1 shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {!msg.read && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                        <span className={`text-sm truncate ${!msg.read ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
                          {msg.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {msg.starred && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(msg.createdAt)}</span>
                      </div>
                    </div>
                    {msg.topic && (
                      <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary mt-1">
                        {msg.topic}
                      </span>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className={`${selectedId ? "flex" : "hidden lg:flex"} flex-col flex-1 min-w-0`}>
          {selectedMsg ? (
            <div className="flex flex-col h-full">
              {/* Detail Header */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
                <button
                  onClick={() => setSelectedId(null)}
                  className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex-1" />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAction(selectedMsg.starred ? "unstar" : "star", [selectedMsg.id])}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    title={selectedMsg.starred ? "Bỏ đánh dấu" : "Đánh dấu sao"}
                  >
                    {selectedMsg.starred ? (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ) : (
                      <StarOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => handleAction(selectedMsg.read ? "unread" : "read", [selectedMsg.id])}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    title={selectedMsg.read ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
                  >
                    {selectedMsg.read ? (
                      <MailOpen className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Mail className="w-4 h-4 text-primary" />
                    )}
                  </button>
                  <button
                    onClick={() => handleAction(selectedMsg.archived ? "unarchive" : "archive", [selectedMsg.id])}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    title={selectedMsg.archived ? "Gỡ lưu trữ" : "Lưu trữ"}
                  >
                    {selectedMsg.archived ? (
                      <ArchiveRestore className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Archive className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Xóa vĩnh viễn tin nhắn này?")) {
                        handleAction("delete", [selectedMsg.id]);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Xóa vĩnh viễn"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </button>
                </div>
              </div>

              {/* Detail Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {/* Sender Info */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold shrink-0 border border-primary/20">
                    {selectedMsg.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-foreground">{selectedMsg.name}</h3>
                    <a
                      href={`mailto:${selectedMsg.email}`}
                      className="text-sm text-primary hover:underline underline-offset-4"
                    >
                      {selectedMsg.email}
                    </a>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatFullDate(selectedMsg.createdAt)}
                      </span>
                      {selectedMsg.topic && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {selectedMsg.topic}
                        </span>
                      )}
                      <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                        {selectedMsg.ticket}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                    {selectedMsg.message}
                  </p>
                </div>

                {/* Quick Reply */}
                <div className="pt-2">
                  <a
                    href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.ticket}&body=%0A%0A---%0ATin nhắn gốc từ ${selectedMsg.name}:%0A${encodeURIComponent(selectedMsg.message)}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:brightness-110 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    Trả lời qua Email
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-3 py-16">
              <Inbox className="w-12 h-12 opacity-20" />
              <p className="text-sm">Chọn một tin nhắn để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
