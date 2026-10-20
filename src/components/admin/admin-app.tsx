"use client";

import { LoginForm } from "@/components/admin/login-form";
import { useToast } from "@/hooks/use-toast";
import type { SiteProfile } from "@/lib/cv/site-data-server";
import { ChevronDown,ExternalLink,Menu,X } from "lucide-react";
import dynamic from "next/dynamic";
import * as React from "react";

import "./admin.css";

const loadingTab = () => <p role="status" className="text-muted-foreground">Đang tải…</p>;
const ProfileTab = dynamic(() => import("./profile-tab").then((m) => m.ProfileTab), { loading: loadingTab });
const HomeSettingsTab = dynamic(() => import("./home-settings-tab").then((m) => m.HomeSettingsTab), { loading: loadingTab });
const ProjectsTab = dynamic(() => import("./projects-tab").then((m) => m.ProjectsTab), { loading: loadingTab });
const ExperiencesTab = dynamic(() => import("./experiences-tab").then((m) => m.ExperiencesTab), { loading: loadingTab });
const PostsTab = dynamic(() => import("./posts-tab").then((m) => m.PostsTab), { loading: loadingTab });
const CommentsTab = dynamic(() => import("./comments-tab").then((m) => m.CommentsTab), { loading: loadingTab });
const EducationTab = dynamic(() => import("./education-tab").then((m) => m.EducationTab), { loading: loadingTab });
const SettingsTab = dynamic(() => import("./settings-tab").then((m) => m.SettingsTab), { loading: loadingTab });
const ActivityLogTab = dynamic(() => import("./activity-log-tab").then((m) => m.ActivityLogTab), { loading: loadingTab });
const InboxTab = dynamic(() => import("./inbox-tab").then((m) => m.InboxTab), { loading: loadingTab });

type Stage = "checking" | "login" | "dashboard";

type TabId =
  | "profile"
  | "config"
  | "education"
  | "projects"
  | "experiences"
  | "posts"
  | "comments"
  | "inbox"
  | "settings"
  | "activity";

function Dashboard({
  initialProfile,
  onLogout,
}: {
  initialProfile: SiteProfile | null;
  onLogout: () => void;
}) {
  const [locale, setLocale] = React.useState<"vi" | "en">("vi");
  const [activeTab, setActiveTab] = React.useState<TabId>("projects");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = React.useState("general");
  const sidebarRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (!sidebarOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const buttons = () => sidebarRef.current?.querySelectorAll<HTMLButtonElement>("button");
    buttons()?.[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
      if (event.key !== "Tab") return;
      const list = buttons(); const first = list?.[0]; const last = list?.[list.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const resize = () => { if (window.innerWidth > 900) setSidebarOpen(false); };
    window.addEventListener("keydown", keydown); window.addEventListener("resize", resize);
    return () => { document.body.style.overflow = previousOverflow; previousFocus?.focus(); window.removeEventListener("keydown", keydown); window.removeEventListener("resize", resize); };
  }, [sidebarOpen]);

  // Close sidebar on mobile when tab changes
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);

  const navItems = [
    { id: "profile" as TabId, icon: "◎", label: "Hồ sơ" },
    { id: "config" as TabId, icon: "◌", label: "Trang chủ" },
    { id: "education" as TabId, icon: "▣", label: "Học vấn" },
    { id: "projects" as TabId, icon: "◆", label: "Dự án" },
    { id: "experiences" as TabId, icon: "◈", label: "Kinh nghiệm" },
    { id: "posts" as TabId, icon: "✦", label: "Bài viết" },
    { id: "comments" as TabId, icon: "💬", label: "Bình luận" },
    { id: "inbox" as TabId, icon: "📬", label: "Hộp thư" },
  ];

  const sysItems = [
    { id: "settings" as TabId, icon: "⚙", label: "Cài đặt" },
    { id: "activity" as TabId, icon: "◐", label: "Activity Log" },
  ];


  const settingsSubItems = [
    { id: "general", label: "Tổng quan" },
    { id: "account", label: "Tài khoản & Bảo mật" },
    { id: "portfolio", label: "Thông tin & SEO" },
    { id: "navigation", label: "Điều hướng" },
    { id: "integrations", label: "Tích hợp" },
  ];

  const currentTabLabel =
    [...navItems, ...sysItems].find((i) => i.id === activeTab)?.label || "Trang quản trị";

  return (
    <div className="admin-theme admin-body">
      <div className="admin-app">
        {/* =====================================================
             SIDEBAR
        ====================================================== */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 min-[901px]:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside ref={sidebarRef} id="admin-navigation" role={sidebarOpen ? "dialog" : undefined} aria-modal={sidebarOpen || undefined} aria-label="Điều hướng quản trị" className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="admin-brand">
            <div className="admin-brand-logo">&lt;/&gt;</div>
            <div className="admin-brand-text">
              <strong>Engineering Lab</strong>
              <span>CONTROL CENTER</span>
            </div>
            <button
              className="min-[901px]:hidden ml-auto text-muted-foreground p-2"
              aria-label="Đóng menu quản trị"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="admin-nav-title">MANAGEMENT</div>
          <nav className="admin-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`admin-nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="admin-nav-title mt-4">SYSTEM</div>
          <nav className="admin-nav">
            <button
              className={`admin-nav-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("settings");
                setSettingsOpen(!settingsOpen);
              }}
            >
              <span className="admin-nav-icon">⚙</span>
              <span className="admin-nav-label">Cài đặt</span>
              <ChevronDown className={`size-4 transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
            </button>

            {settingsOpen && (
              <div className="admin-subnav">
                {settingsSubItems.map((sub, index) => (
                  <button
                    key={sub.id}
                    className={`admin-subnav-item ${activeTab === "settings" && activeSettingsTab === sub.id ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab("settings");
                      setActiveSettingsTab(sub.id);
                    }}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}

            <button
              className={`admin-nav-item ${activeTab === "activity" ? "active" : ""}`}
              onClick={() => setActiveTab("activity")}
            >
              <span className="admin-nav-icon">◐</span>
              <span className="admin-nav-label">Activity Log</span>
            </button>
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-user-mini">
              <div className="admin-user-avatar">
                {initialProfile?.name ? initialProfile.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="admin-user-info">
                <strong>{initialProfile?.name || "Administrator"}</strong>
                <span>Admin</span>
              </div>
            </div>
          </div>
        </aside>

        {/* =====================================================
             MAIN
        ====================================================== */}
        <main className="admin-main" inert={sidebarOpen || undefined}>
          {/* TOPBAR */}
          <header className="admin-topbar">
            <div className="admin-page-context">
              <button
                className="min-[901px]:hidden mr-2 text-muted-foreground p-2"
                aria-label="Mở menu quản trị"
                aria-expanded={sidebarOpen}
                aria-controls="admin-navigation"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="size-4" />
              </button>
              <span className="hidden sm:inline">Admin</span>
              <span className="hidden sm:inline">/</span>
              <strong>{currentTabLabel}</strong>
            </div>

            <div className="admin-top-actions">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="admin-top-button hidden sm:flex"
              >
                <ExternalLink className="size-3.5 mr-1" /> Xem trang web
              </a>
              <button
                className={`admin-top-button ${locale === "vi" ? "primary" : ""}`}
                onClick={() => setLocale("vi")}
                aria-pressed={locale === "vi"}
                title="Quản lý nội dung tiếng Việt"
              >
                VI
              </button>
              <button
                className={`admin-top-button ${locale === "en" ? "primary" : ""}`}
                onClick={() => setLocale("en")}
                aria-pressed={locale === "en"}
                title="Quản lý nội dung tiếng Anh"
              >
                EN
              </button>
              <button className="admin-top-button" onClick={onLogout}>
                Đăng xuất
              </button>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <div className="admin-page-container">
            {activeTab === "profile" && <ProfileTab initial={initialProfile} locale={locale} />}
            {activeTab === "config" && <HomeSettingsTab />}
            {activeTab === "education" && <EducationTab initial={initialProfile} locale={locale} />}
            {activeTab === "projects" && <ProjectsTab locale={locale} />}
            {activeTab === "experiences" && <ExperiencesTab locale={locale} />}
            {activeTab === "posts" && <PostsTab locale={locale} />}
            {activeTab === "comments" && <CommentsTab locale={locale} profile={initialProfile} />}
            {activeTab === "inbox" && <InboxTab />}
            {activeTab === "settings" && <SettingsTab activeTab={activeSettingsTab} />}
            {activeTab === "activity" && <ActivityLogTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminApp() {
  const { toast } = useToast();
  const [stage, setStage] = React.useState<Stage>("checking");
  const [profile, setProfile] = React.useState<SiteProfile | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/admin/session", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (data?.authed) {
          try {
            const sd = await fetch("/api/admin/profile?locale=vi", { cache: "no-store" });
            const sdData = await sd.json().catch(() => ({}));
            if (!cancelled && sdData?.ok && sdData.profile) setProfile(sdData.profile);
          } catch {}
          setStage("dashboard");
        } else {
          setStage("login");
        }
      } catch {
        if (!cancelled) setStage("login");
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setProfile(null);
      setStage("login");
      toast({ title: "Đã đăng xuất", description: "Phiên đã kết thúc." });
    } catch {
      toast({ title: "Lỗi đăng xuất", variant: "destructive" });
    }
  }

  if (stage === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (stage === "login") {
    return <LoginForm onSuccess={() => setStage("dashboard")} />;
  }

  return <Dashboard initialProfile={profile} onLogout={handleLogout} />;
}
