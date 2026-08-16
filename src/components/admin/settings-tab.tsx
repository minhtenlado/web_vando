"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";

export const initialSettings = {
  // General
  autoSaveDraft: true,
  unsavedWarning: true,
  activityTracking: true,
  analyticsEnabled: false,

  // Account
  adminName: "Phan Huỳnh Văn Đô",
  adminEmail: "admin@example.com",
  adminUsername: "admin",
  adminRole: "Administrator",
  adminAvatarUrl: "/images/profile.webp",

  // Appearance
  darkMode: true,
  compactMode: true,
  fixedSidebar: true,
  accentColor: "Emerald",
  fontSize: "Compact",

  // Portfolio
  portfolioName: "Phan Huỳnh Văn Đô",
  portfolioDomain: "phanhuynh.id.vn",
  portfolioTagline: "RTOS Developer • Embedded Linux • AIoT",
  availabilityText: "Sẵn sàng cho cơ hội mới",
  showAiButton: true,
  showLocation: true,
  showDownloadCv: true,
  maintenanceBanner: false,

  // Navigation
  navAboutEnabled: true,
  navSkillsEnabled: true,
  navProjectsEnabled: true,
  navExperienceEnabled: true,
  navBlogEnabled: true,
  navContactEnabled: true,

  // SEO
  metaTitle: "Phan Huỳnh Văn Đô — RTOS Developer",
  metaDescription: "Portfolio của Phan Huỳnh Văn Đô — RTOS Developer, Embedded Linux, STM32, ESP32, IoT và Edge AI.",
  canonicalUrl: "https://phanhuynh.id.vn/",
  robots: "index, follow",
  ogTitle: "Phan Huỳnh Văn Đô",
  ogImageUrl: "/images/og-cover.webp",

  // Integrations
  aiEndpoint: "",
  analyticsId: "",
  webhookUrl: "",

  // Notifications
  emailOnContact: true,
  failedLoginAlert: true,
  deploymentNotification: true,
  weeklySummary: false,

  // Security
  twoFactorAuth: true,
  loginRateLimit: "5 attempts / 15m",
  sessionTimeout: "4 giờ",
  loginHistory: true,
};

type SettingsType = typeof initialSettings;

export function SettingsTab({ activeTab = 'general' }: { activeTab?: string }) {
  const { toast } = useToast();
    const [settings, setSettings] = React.useState<SettingsType>(initialSettings);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) throw new Error("Lỗi fetch settings");
        const data = await res.json();
        if (data.settings && data.settings !== "{}") {
          setSettings({ ...initialSettings, ...JSON.parse(data.settings) });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu cấu hình.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error("Lỗi lưu cấu hình");
      toast({
        title: "Thành công",
        description: "Đã lưu thay đổi cấu hình.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu cấu hình.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof SettingsType, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin size-8 border-2 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="settings-layout-pro" id="settingsView">
      

      <main className="settings-panel-pro">
        {/* GENERAL */}
        {activeTab === "general" && (
          <div className="settings-panel-view active">
            <div className="setting-panel-heading">
              <div>
                <h2>Tổng quan hệ thống</h2>
                <p>Những thiết lập chung ảnh hưởng đến toàn bộ CMS.</p>
              </div>
              <span className="setting-state-badge green">CONFIGURED</span>
            </div>

            <div className="setting-card-grid">
              <div className="setting-info-card">
                <span className="setting-info-icon">◎</span>
                <div>
                  <strong>Website status</strong>
                  <small>Portfolio đang hoạt động</small>
                </div>
                <b className="status-text green">ONLINE</b>
              </div>
              <div className="setting-info-card">
                <span className="setting-info-icon">◐</span>
                <div>
                  <strong>Environment</strong>
                  <small>Production deployment</small>
                </div>
                <b className="status-text">PROD</b>
              </div>
              <div className="setting-info-card">
                <span className="setting-info-icon">⌁</span>
                <div>
                  <strong>Last deployment</strong>
                  <small>16/08/2026 · 14:32</small>
                </div>
                <b className="status-text green">OK</b>
              </div>
              <div className="setting-info-card">
                <span className="setting-info-icon">◉</span>
                <div>
                  <strong>Database</strong>
                  <small>Connected / healthy</small>
                </div>
                <b className="status-text green">HEALTHY</b>
              </div>
            </div>

            <div className="form-section-pro">
              <div className="form-section-title-pro">SYSTEM PREFERENCES</div>
              <div className="setting-row-pro">
                <div>
                  <strong>Auto save draft</strong>
                  <span>Tự động lưu nội dung đang chỉnh sửa.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.autoSaveDraft}
                    onChange={(e) => updateSetting("autoSaveDraft", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Unsaved changes warning</strong>
                  <span>Cảnh báo trước khi rời trang khi chưa lưu.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.unsavedWarning}
                    onChange={(e) => updateSetting("unsavedWarning", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Activity tracking</strong>
                  <span>Ghi lại thao tác quản trị vào Activity Log.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.activityTracking}
                    onChange={(e) => updateSetting("activityTracking", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Analytics</strong>
                  <span>Theo dõi lượt truy cập và hành vi trên portfolio.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.analyticsEnabled}
                    onChange={(e) => updateSetting("analyticsEnabled", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT */}
        {activeTab === "account" && (
          <div className="settings-panel-view active">
            <div className="setting-panel-heading">
              <div>
                <h2>Tài khoản quản trị</h2>
                <p>Thông tin cá nhân và quyền truy cập CMS.</p>
              </div>
            </div>

            <div className="form-section-pro">
              <div className="form-grid-pro">
                <label className="field-pro">
                  <span>Họ và tên</span>
                  <input
                    type="text"
                    value={settings.adminName}
                    onChange={(e) => updateSetting("adminName", e.target.value)}
                  />
                </label>
                <label className="field-pro">
                  <span>Email quản trị</span>
                  <input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => updateSetting("adminEmail", e.target.value)}
                  />
                </label>
                <label className="field-pro">
                  <span>Username</span>
                  <input
                    type="text"
                    value={settings.adminUsername}
                    onChange={(e) => updateSetting("adminUsername", e.target.value)}
                  />
                </label>
                <label className="field-pro">
                  <span>Role</span>
                  <select
                    value={settings.adminRole}
                    onChange={(e) => updateSetting("adminRole", e.target.value)}
                  >
                    <option>Administrator</option>
                    <option>Editor</option>
                    <option>Author</option>
                  </select>
                </label>
                <label className="field-pro full">
                  <span>Avatar URL</span>
                  <input
                    type="url"
                    value={settings.adminAvatarUrl}
                    onChange={(e) => updateSetting("adminAvatarUrl", e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="form-section-pro">
              <div className="form-section-title-pro">ACCOUNT SECURITY</div>
              <div className="security-action-row">
                <div>
                  <strong>Đổi mật khẩu</strong>
                  <span>Sử dụng mật khẩu mạnh và không dùng lại mật khẩu cũ.</span>
                </div>
                <button className="outline-btn-pro" type="button">
                  Đổi mật khẩu
                </button>
              </div>
              <div className="security-action-row">
                <div>
                  <strong>Đăng xuất tất cả phiên</strong>
                  <span>Hủy các session đang hoạt động trên thiết bị khác.</span>
                </div>
                <button className="danger-outline-btn" type="button">
                  Đăng xuất
                </button>
              </div>
            </div>

<div className="form-section-pro">
              <div className="setting-row-pro">
                <div>
                  <strong>Two-factor authentication</strong>
                  <span>Yêu cầu xác thực hai bước khi đăng nhập.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => updateSetting("twoFactorAuth", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Login rate limit</strong>
                  <span>Giới hạn số lần đăng nhập thất bại.</span>
                </div>
                <select
                  className="small-select-pro"
                  value={settings.loginRateLimit}
                  onChange={(e) => updateSetting("loginRateLimit", e.target.value)}
                >
                  <option>5 attempts / 15m</option>
                  <option>10 attempts / 15m</option>
                  <option>20 attempts / 15m</option>
                </select>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Session timeout</strong>
                  <span>Tự động hết phiên khi không hoạt động.</span>
                </div>
                <select
                  className="small-select-pro"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting("sessionTimeout", e.target.value)}
                >
                  <option>30 phút</option>
                  <option>1 giờ</option>
                  <option>4 giờ</option>
                  <option>12 giờ</option>
                </select>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Login history</strong>
                  <span>Lưu IP, thiết bị và thời gian đăng nhập.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.loginHistory}
                    onChange={(e) => updateSetting("loginHistory", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
            </div>
            <div className="danger-panel">
              <div>
                <strong>Danger Zone</strong>
                <span>Các thao tác có thể ảnh hưởng quyền truy cập toàn hệ thống.</span>
              </div>
              <button className="danger-outline-btn" type="button">
                Revoke all sessions
              </button>
            </div>
                    </div>
        )}

        {/* APPEARANCE */}
        {activeTab === "appearance" && (
          <div className="settings-panel-view active">
            <div className="setting-panel-heading">
              <div>
                <h2>Giao diện</h2>
                <p>Cấu hình giao diện admin và trải nghiệm thao tác.</p>
              </div>
            </div>
            <div className="form-section-pro">
              <div className="setting-row-pro">
                <div>
                  <strong>Dark mode</strong>
                  <span>Giao diện tối cho admin dashboard.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) => updateSetting("darkMode", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Compact mode</strong>
                  <span>Giảm khoảng cách giữa các thành phần.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={(e) => updateSetting("compactMode", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Fixed sidebar</strong>
                  <span>Sidebar luôn cố định khi cuộn.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.fixedSidebar}
                    onChange={(e) => updateSetting("fixedSidebar", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
              <div className="form-grid-pro">
                <label className="field-pro">
                  <span>Accent color</span>
                  <select
                    value={settings.accentColor}
                    onChange={(e) => updateSetting("accentColor", e.target.value)}
                  >
                    <option>Emerald</option>
                    <option>Blue</option>
                    <option>Purple</option>
                    <option>Orange</option>
                  </select>
                </label>
                <label className="field-pro">
                  <span>Font size</span>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => updateSetting("fontSize", e.target.value)}
                  >
                    <option>Compact</option>
                    <option>Normal</option>
                    <option>Large</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* PORTFOLIO */}
        {activeTab === "portfolio" && (
          <div className="settings-panel-view active">
            <div className="setting-panel-heading">
              <div>
                <h2>Portfolio</h2>
                <p>Cấu hình nội dung và trạng thái website public.</p>
              </div>
            </div>
            <div className="form-section-pro">
              <div className="form-grid-pro">
                <label className="field-pro">
                  <span>Tên website</span>
                  <input
                    type="text"
                    value={settings.portfolioName}
                    onChange={(e) => updateSetting("portfolioName", e.target.value)}
                  />
                </label>
                <label className="field-pro">
                  <span>Domain</span>
                  <input
                    type="text"
                    value={settings.portfolioDomain}
                    onChange={(e) => updateSetting("portfolioDomain", e.target.value)}
                  />
                </label>
                <label className="field-pro full">
                  <span>Tagline</span>
                  <input
                    type="text"
                    value={settings.portfolioTagline}
                    onChange={(e) => updateSetting("portfolioTagline", e.target.value)}
                  />
                </label>
                <label className="field-pro full">
                  <span>Availability text</span>
                  <input
                    type="text"
                    value={settings.availabilityText}
                    onChange={(e) => updateSetting("availabilityText", e.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="form-section-pro">
              <div className="setting-row-pro">
                <div>
                  <strong>Hiển thị nút Hỏi AI</strong>
                  <span>Hiển thị chatbot ở góc website.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.showAiButton}
                    onChange={(e) => updateSetting("showAiButton", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Hiển thị location</strong>
                  <span>Hiển thị thành phố trong phần Hero và Contact.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.showLocation}
                    onChange={(e) => updateSetting("showLocation", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Hiển thị download CV</strong>
                  <span>Hiển thị nút tải CV trên portfolio.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.showDownloadCv}
                    onChange={(e) => updateSetting("showDownloadCv", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Maintenance banner</strong>
                  <span>Hiển thị cảnh báo bảo trì trên website.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceBanner}
                    onChange={(e) => updateSetting("maintenanceBanner", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
            </div>

<div className="form-section-pro">
              <div className="form-grid-pro">
                <label className="field-pro full">
                  <span>Meta title</span>
                  <input
                    type="text"
                    value={settings.metaTitle}
                    onChange={(e) => updateSetting("metaTitle", e.target.value)}
                  />
                </label>
                <label className="field-pro full">
                  <span>Meta description</span>
                  <textarea
                    value={settings.metaDescription}
                    onChange={(e) => updateSetting("metaDescription", e.target.value)}
                  />
                </label>
                <label className="field-pro">
                  <span>Canonical URL</span>
                  <input
                    type="url"
                    value={settings.canonicalUrl}
                    onChange={(e) => updateSetting("canonicalUrl", e.target.value)}
                  />
                </label>
                <label className="field-pro">
                  <span>Robots</span>
                  <select
                    value={settings.robots}
                    onChange={(e) => updateSetting("robots", e.target.value)}
                  >
                    <option>index, follow</option>
                    <option>index, nofollow</option>
                    <option>noindex, follow</option>
                    <option>noindex, nofollow</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="form-section-pro">
              <div className="form-section-title-pro">SOCIAL PREVIEW</div>
              <div className="form-grid-pro">
                <label className="field-pro">
                  <span>OG title</span>
                  <input
                    type="text"
                    value={settings.ogTitle}
                    onChange={(e) => updateSetting("ogTitle", e.target.value)}
                  />
                </label>
                <label className="field-pro">
                  <span>OG image URL</span>
                  <input
                    type="url"
                    value={settings.ogImageUrl}
                    onChange={(e) => updateSetting("ogImageUrl", e.target.value)}
                  />
                </label>
              </div>
            </div>
                    </div>
        )}

        {/* NAVIGATION */}
        {activeTab === "navigation" && (
          <div className="settings-panel-view active">
            <div className="setting-panel-heading">
              <div>
                <h2>Điều hướng</h2>
                <p>Quản lý menu và thứ tự section trên portfolio.</p>
              </div>
            </div>
            <div className="form-section-pro">
              <div className="sortable-menu">
                <div className="sortable-row">
                  <span className="drag-handle">☷</span>
                  <span className="sort-order">01</span>
                  <strong>Giới thiệu</strong>
                  <span className="sort-key">about</span>
                  <label className="switch-pro mini">
                    <input
                      type="checkbox"
                      checked={settings.navAboutEnabled}
                      onChange={(e) => updateSetting("navAboutEnabled", e.target.checked)}
                    />
                    <span></span>
                  </label>
                </div>
                <div className="sortable-row">
                  <span className="drag-handle">☷</span>
                  <span className="sort-order">02</span>
                  <strong>Kỹ năng</strong>
                  <span className="sort-key">skills</span>
                  <label className="switch-pro mini">
                    <input
                      type="checkbox"
                      checked={settings.navSkillsEnabled}
                      onChange={(e) => updateSetting("navSkillsEnabled", e.target.checked)}
                    />
                    <span></span>
                  </label>
                </div>
                <div className="sortable-row">
                  <span className="drag-handle">☷</span>
                  <span className="sort-order">03</span>
                  <strong>Dự án</strong>
                  <span className="sort-key">projects</span>
                  <label className="switch-pro mini">
                    <input
                      type="checkbox"
                      checked={settings.navProjectsEnabled}
                      onChange={(e) => updateSetting("navProjectsEnabled", e.target.checked)}
                    />
                    <span></span>
                  </label>
                </div>
                <div className="sortable-row">
                  <span className="drag-handle">☷</span>
                  <span className="sort-order">04</span>
                  <strong>Kinh nghiệm</strong>
                  <span className="sort-key">experience</span>
                  <label className="switch-pro mini">
                    <input
                      type="checkbox"
                      checked={settings.navExperienceEnabled}
                      onChange={(e) => updateSetting("navExperienceEnabled", e.target.checked)}
                    />
                    <span></span>
                  </label>
                </div>
                <div className="sortable-row">
                  <span className="drag-handle">☷</span>
                  <span className="sort-order">05</span>
                  <strong>Bài viết</strong>
                  <span className="sort-key">blog</span>
                  <label className="switch-pro mini">
                    <input
                      type="checkbox"
                      checked={settings.navBlogEnabled}
                      onChange={(e) => updateSetting("navBlogEnabled", e.target.checked)}
                    />
                    <span></span>
                  </label>
                </div>
                <div className="sortable-row">
                  <span className="drag-handle">☷</span>
                  <span className="sort-order">06</span>
                  <strong>Liên hệ</strong>
                  <span className="sort-key">contact</span>
                  <label className="switch-pro mini">
                    <input
                      type="checkbox"
                      checked={settings.navContactEnabled}
                      onChange={(e) => updateSetting("navContactEnabled", e.target.checked)}
                    />
                    <span></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INTEGRATIONS */}
        {activeTab === "integrations" && (
          <div className="settings-panel-view active">
            <div className="setting-panel-heading">
              <div>
                <h2>Tích hợp</h2>
                <p>Quản lý các dịch vụ bên ngoài mà portfolio sử dụng.</p>
              </div>
            </div>
            <div className="integration-card-grid">
              <div className="integration-card">
                <div className="integration-icon">G</div>
                <div>
                  <strong>Google Analytics</strong>
                  <small>Traffic analytics</small>
                </div>
                <span className="integration-state">CONNECTED</span>
              </div>
              <div className="integration-card">
                <div className="integration-icon">V</div>
                <div>
                  <strong>Vercel</strong>
                  <small>Deployment platform</small>
                </div>
                <span className="integration-state">CONNECTED</span>
              </div>
              <div className="integration-card">
                <div className="integration-icon">✉</div>
                <div>
                  <strong>Email / SMTP</strong>
                  <small>Contact messages</small>
                </div>
                <span className="integration-state warning">SETUP</span>
              </div>
              <div className="integration-card">
                <div className="integration-icon">AI</div>
                <div>
                  <strong>AI Assistant</strong>
                  <small>Portfolio chatbot</small>
                </div>
                <span className="integration-state">READY</span>
              </div>
            </div>
            <div className="form-section-pro">
              <div className="form-grid-pro">
                <label className="field-pro full">
                  <span>AI endpoint</span>
                  <input
                    type="url"
                    placeholder="https://api.example.com/v1/chat"
                    value={settings.aiEndpoint}
                    onChange={(e) => updateSetting("aiEndpoint", e.target.value)}
                  />
                </label>
                <label className="field-pro">
                  <span>Analytics ID</span>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={settings.analyticsId}
                    onChange={(e) => updateSetting("analyticsId", e.target.value)}
                  />
                </label>
                <label className="field-pro">
                  <span>Webhook URL</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={settings.webhookUrl}
                    onChange={(e) => updateSetting("webhookUrl", e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="settings-panel-view active">
            <div className="setting-panel-heading">
              <div>
                <h2>Thông báo</h2>
                <p>Kiểm soát cảnh báo trong admin và email.</p>
              </div>
            </div>
            <div className="form-section-pro">
              <div className="setting-row-pro">
                <div>
                  <strong>Email khi có contact mới</strong>
                  <span>Gửi thông báo khi khách truy cập gửi liên hệ.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.emailOnContact}
                    onChange={(e) => updateSetting("emailOnContact", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Cảnh báo đăng nhập thất bại</strong>
                  <span>Thông báo khi có nhiều lần đăng nhập không thành công.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.failedLoginAlert}
                    onChange={(e) => updateSetting("failedLoginAlert", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Deployment notification</strong>
                  <span>Thông báo khi website deploy thành công hoặc lỗi.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.deploymentNotification}
                    onChange={(e) => updateSetting("deploymentNotification", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Weekly summary</strong>
                  <span>Gửi thống kê hoạt động hàng tuần.</span>
                </div>
                <label className="switch-pro">
                  <input
                    type="checkbox"
                    checked={settings.weeklySummary}
                    onChange={(e) => updateSetting("weeklySummary", e.target.checked)}
                  />
                  <span></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* BACKUP */}
        {activeTab === "backup" && (
          <div className="settings-panel-view active">
            <div className="setting-panel-heading">
              <div>
                <h2>Dữ liệu & Backup</h2>
                <p>Sao lưu và khôi phục toàn bộ nội dung CMS.</p>
              </div>
            </div>
            <div className="backup-grid-pro">
              <div className="backup-card-pro">
                <span className="backup-icon-pro">↓</span>
                <div>
                  <strong>Export JSON</strong>
                  <small>Profile, Skills, Projects, Experience, Education & Settings.</small>
                </div>
                <button className="outline-btn-pro" type="button">Export</button>
              </div>
              <div className="backup-card-pro">
                <span className="backup-icon-pro">↑</span>
                <div>
                  <strong>Import data</strong>
                  <small>Khôi phục từ file backup JSON.</small>
                </div>
                <button className="outline-btn-pro" type="button">Import</button>
              </div>
              <div className="backup-card-pro">
                <span className="backup-icon-pro">⟳</span>
                <div>
                  <strong>Database snapshot</strong>
                  <small>Tạo snapshot trước khi cập nhật lớn.</small>
                </div>
                <button className="outline-btn-pro" type="button">Snapshot</button>
              </div>
              <div className="backup-card-pro">
                <span className="backup-icon-pro">◫</span>
                <div>
                  <strong>Media backup</strong>
                  <small>Sao lưu ảnh và file upload.</small>
                </div>
                <button className="outline-btn-pro" type="button">Backup</button>
              </div>
            </div>
            <div className="last-backup-pro">
              <span></span>
              Last successful backup:
              <strong>16/08/2026 · 14:40</strong>
            </div>

<div className="form-section-pro">
              <div className="setting-row-pro">
                <div>
                  <strong>Maintenance mode</strong>
                  <span>Tạm thời ẩn website khỏi người dùng.</span>
                </div>
                <label className="switch-pro">
                  <input type="checkbox" />
                  <span></span>
                </label>
              </div>
              <div className="setting-row-pro">
                <div>
                  <strong>Disable public writes</strong>
                  <span>Tạm thời khóa các form gửi dữ liệu.</span>
                </div>
                <label className="switch-pro">
                  <input type="checkbox" />
                  <span></span>
                </label>
              </div>
              <div className="maintenance-actions">
                <button className="outline-btn-pro" type="button">Clear cache</button>
                <button className="outline-btn-pro" type="button">Rebuild search index</button>
                <button className="outline-btn-pro" type="button">Revalidate pages</button>
              </div>
            </div>
                    </div>
        )}

        {/* SAVE BAR */}
        <div className="settings-save-bar-pro">
          <span>SETTINGS / UNSAVED CHANGES</span>
          <div>
            <button className="outline-btn-pro" type="button">
              Hủy
            </button>
            <button
              className="save-btn-pro"
              id="saveSettingsBtn"
              onClick={handleSave}
              disabled={saving}
              type="button"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
