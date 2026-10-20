"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const settingsDefaults = {
  portfolioName: "Engineering Lab",
  portfolioTagline: "Embedded systems, edge AI, and robotics projects.",
  metaTitle: "Engineering Lab | Embedded Systems, Edge AI & Robotics",
  metaDescription: "Technical projects across embedded systems, edge AI, robotics, IoT, hardware, and software.",
  ogTitle: "Engineering Lab",
  ogImageUrl: "/images/og-cover.webp",
  navBlogEnabled: true,
  analyticsEnabled: false,
  analyticsId: "",
};

type Settings = typeof settingsDefaults;

function parseSettings(raw: unknown): Settings {
  if (typeof raw !== "string") return settingsDefaults;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return settingsDefaults;
    const source = value as Record<string, unknown>;
    const parsed = { ...settingsDefaults };
    for (const key of Object.keys(settingsDefaults) as (keyof Settings)[]) {
      if (typeof source[key] === typeof settingsDefaults[key]) {
        Object.assign(parsed, { [key]: source[key] });
      }
    }
    return parsed;
  } catch {
    return settingsDefaults;
  }
}

export function SettingsTab({ activeTab = "general" }: { activeTab?: string }) {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState<Settings>(settingsDefaults);
  const [loading, setLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function fetchSettings() {
      try {
        const response = await fetch("/api/admin/settings", { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Không thể tải cấu hình.");
        if (!cancelled) setSettings(parseSettings(data.settings));
      } catch (error) {
        if (!cancelled) toast({
          title: "Không thể tải cấu hình",
          description: error instanceof Error ? error.message : "Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSettings();
    return () => { cancelled = true; };
  }, [toast]);

  async function saveSettings() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Không thể lưu cấu hình.");
      setSettings(parseSettings(data.settings));
      toast({ title: "Đã lưu cấu hình", description: "Cài đặt website đã được lưu." });
    } catch (error) {
      toast({
        title: "Lưu thất bại",
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Không thể đổi mật khẩu.");
      toast({ title: "Đã đổi mật khẩu", description: data.message || "Mật khẩu đã được cập nhật." });
      setIsPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Không thể đổi mật khẩu",
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  if (loading) return <div className="settings-panel-pro" role="status">Đang tải cấu hình…</div>;

  return (
    <div className="settings-layout-pro" id="settingsView">
      <main className="settings-panel-pro">
        {activeTab === "general" && (
          <div className="settings-panel-view active">
            <div className="setting-panel-heading">
              <div>
                <h2>Tổng quan cấu hình</h2>
                <p>Các tuỳ chọn website đang được kết nối với trang công khai.</p>
              </div>
            </div>
            <div className="form-section-pro">
              <p>Hero, thương hiệu và trạng thái các khu vực trang chủ được quản lý trong mục <strong>Trang chủ</strong>. Nội dung dự án và ghi chú được lấy trực tiếp từ CMS.</p>
              <p>Thông tin môi trường, trạng thái database, deploy và sao lưu không được đọc từ hệ thống nên không hiển thị trạng thái giả.</p>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="settings-panel-view active">
            <div className="setting-panel-heading">
              <div><h2>Tài khoản & bảo mật</h2><p>Đổi mật khẩu bằng cơ chế xác thực hiện tại.</p></div>
            </div>
            <div className="form-section-pro">
              <div className="security-action-row">
                <div><strong>Đổi mật khẩu</strong><span>Yêu cầu mật khẩu hiện tại trước khi lưu mật khẩu mới.</span></div>
                <button className="outline-btn-pro" type="button" onClick={() => setIsPasswordModalOpen(true)}>Đổi mật khẩu</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="settings-panel-view active">
            <div className="setting-panel-heading">
              <div><h2>SEO trang chủ</h2><p>Tiêu đề và mô tả được dùng trong metadata của website.</p></div>
            </div>
            <div className="form-section-pro">
              <div className="form-grid-pro">
                <label className="field-pro full"><span>Meta title</span><input maxLength={160} value={settings.metaTitle} onChange={(event) => update("metaTitle", event.target.value)} /></label>
                <label className="field-pro full"><span>Meta description</span><textarea maxLength={320} value={settings.metaDescription} onChange={(event) => update("metaDescription", event.target.value)} /></label>
                <label className="field-pro"><span>Open Graph title</span><input maxLength={160} value={settings.ogTitle} onChange={(event) => update("ogTitle", event.target.value)} /></label>
                <label className="field-pro"><span>Open Graph image URL</span><input type="url" value={settings.ogImageUrl} onChange={(event) => update("ogImageUrl", event.target.value)} /></label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "navigation" && (
          <div className="settings-panel-view active">
            <div className="setting-panel-heading">
              <div><h2>Điều hướng công khai</h2><p>Hiện hoặc ẩn đường dẫn Engineering Notes trên website.</p></div>
            </div>
            <div className="form-section-pro">
              <div className="setting-row-pro">
                <div><strong>Engineering Notes</strong><span>Menu chỉ xuất hiện khi có ghi chú đã xuất bản.</span></div>
                <label className="switch-pro"><input type="checkbox" checked={settings.navBlogEnabled} onChange={(event) => update("navBlogEnabled", event.target.checked)} /><span /></label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="settings-panel-view active">
            <div className="setting-panel-heading">
              <div><h2>Google Analytics</h2><p>Analytics chỉ chạy khi được bật và có mã hợp lệ.</p></div>
            </div>
            <div className="form-section-pro">
              <label className="field-pro"><span>Measurement ID</span><input value={settings.analyticsId} placeholder="G-XXXXXXXXXX" maxLength={128} onChange={(event) => update("analyticsId", event.target.value.trim())} /></label>
              <div className="setting-row-pro">
                <div><strong>Bật Analytics</strong><span>Mã được kiểm tra định dạng trước khi nhúng.</span></div>
                <label className="switch-pro"><input type="checkbox" checked={settings.analyticsEnabled} onChange={(event) => update("analyticsEnabled", event.target.checked)} /><span /></label>
              </div>
            </div>
          </div>
        )}

        <div className="settings-save-bar-pro">
          <span>WEBSITE SETTINGS</span>
          <div>
            <button className="save-btn-pro" onClick={saveSettings} disabled={isSaving} type="button">{isSaving ? "Đang lưu…" : "Lưu thay đổi"}</button>
          </div>
        </div>
      </main>

      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
            <DialogDescription>Nhập mật khẩu hiện tại và mật khẩu mới.</DialogDescription>
          </DialogHeader>
          <form onSubmit={changePassword}>
            <div className="grid gap-4 py-4">
              <label className="grid gap-2 text-sm font-medium">Mật khẩu hiện tại<input type="password" className="w-full rounded border border-border bg-background p-2 text-foreground" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></label>
              <label className="grid gap-2 text-sm font-medium">Mật khẩu mới<input type="password" className="w-full rounded border border-border bg-background p-2 text-foreground" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={8} required /></label>
              <label className="grid gap-2 text-sm font-medium">Xác nhận mật khẩu mới<input type="password" className="w-full rounded border border-border bg-background p-2 text-foreground" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} required /></label>
            </div>
            <DialogFooter>
              <button type="button" className="px-4 py-2 text-sm text-muted-foreground" onClick={() => setIsPasswordModalOpen(false)} disabled={isChangingPassword}>Hủy</button>
              <button type="submit" className="save-btn-pro" disabled={isChangingPassword}>{isChangingPassword ? "Đang xử lý…" : "Lưu mật khẩu"}</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
