"use client";

import * as React from "react";
import { LogOut, ExternalLink, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoginForm } from "@/components/admin/login-form";
import { ProfileTab } from "@/components/admin/profile-tab";
import { PageConfigTab } from "@/components/admin/page-config-tab";
import { ProjectsTab } from "@/components/admin/projects-tab";
import { ExperiencesTab } from "@/components/admin/experiences-tab";
import { PostsTab } from "@/components/admin/posts-tab";
import { EducationTab } from "@/components/admin/education-tab";
import { SettingsTab } from "@/components/admin/settings-tab";
import { ActivityLogTab } from "@/components/admin/activity-log-tab";
import type { SiteProfile } from "@/lib/cv/site-data-server";

import { useLocale } from "@/components/cv/locale-context";
import { useTheme } from "next-themes";
import "./admin.css";

type Stage = "checking" | "login" | "dashboard";

type TabId =
  | "profile"
  | "config"
  | "education"
  | "projects"
  | "experiences"
  | "posts"
  | "settings"
  | "activity";

function Dashboard({
  initialProfile,
  onLogout,
}: {
  initialProfile: SiteProfile | null;
  onLogout: () => void;
}) {
  const { locale, setLocale, t } = useLocale();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState<TabId>("experiences");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = React.useState("general");

  // Close sidebar on mobile when tab changes
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);

  const navItems = [
    { id: "profile" as TabId, icon: "◎", label: "Hồ sơ" },
    { id: "config" as TabId, icon: "◌", label: "Cấu hình trang" },
    { id: "education" as TabId, icon: "▣", label: "Học vấn", count: "03" },
    { id: "projects" as TabId, icon: "◆", label: "Dự án", count: "08" },
    { id: "experiences" as TabId, icon: "◈", label: "Kinh nghiệm", count: "03" },
    { id: "posts" as TabId, icon: "✦", label: "Bài viết", count: "06" },
  ];

  const sysItems = [
    { id: "settings" as TabId, icon: "⚙", label: "Cài đặt" },
    { id: "activity" as TabId, icon: "◐", label: "Activity Log" },
  ];

  
  const settingsSubItems = [
    { id: "general", label: "Tổng quan" },
    { id: "account", label: "Tài khoản & Bảo mật" },
    { id: "appearance", label: "Giao diện" },
    { id: "portfolio", label: "Thông tin & SEO" },
    { id: "navigation", label: "Điều hướng" },
    { id: "integrations", label: "Tích hợp" },
    { id: "notifications", label: "Thông báo" },
    { id: "backup", label: "Hệ thống & Dữ liệu" },
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
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="admin-brand">
            <div className="admin-brand-logo">&lt;/&gt;</div>
            <div className="admin-brand-text">
              <strong>portfolio admin</strong>
              <span>content management</span>
            </div>
            <button
              className="md:hidden ml-auto text-muted-foreground p-1"
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
                {item.count && <span className="admin-nav-count">{item.count}</span>}
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
        <main className="admin-main">
          {/* TOPBAR */}
          <header className="admin-topbar">
            <div className="admin-page-context">
              <button
                className="md:hidden mr-2 text-muted-foreground"
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
              >
                VI
              </button>
              <button
                className={`admin-top-button ${locale === "en" ? "primary" : ""}`}
                onClick={() => setLocale("en")}
              >
                EN
              </button>
              <button
                className="admin-top-button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? "☀️ Sáng" : "🌙 Tối"}
              </button>
              <button className="admin-top-button hidden sm:flex" onClick={onLogout}>
                ⇥ Đăng xuất
              </button>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <div className="admin-page-container">
            {activeTab === "profile" && <ProfileTab initial={initialProfile} locale={locale} />}
            {activeTab === "config" && <PageConfigTab initial={initialProfile} locale={locale} />}
            {activeTab === "education" && <EducationTab initial={initialProfile} locale={locale} />}
            {activeTab === "projects" && <ProjectsTab locale={locale} />}
            {activeTab === "experiences" && <ExperiencesTab locale={locale} />}
            {activeTab === "posts" && <PostsTab locale={locale} />}
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
            const sd = await fetch("/api/site-data", { cache: "no-store" });
            const sdData = await sd.json().catch(() => ({}));
            if (!cancelled && sdData?.profile) setProfile(sdData.profile);
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
