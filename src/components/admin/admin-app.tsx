"use client";

import * as React from "react";
import { LogOut, ExternalLink, Terminal, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LoginForm } from "@/components/admin/login-form";
import { ProfileTab } from "@/components/admin/profile-tab";
import { ProjectsTab } from "@/components/admin/projects-tab";
import { ExperiencesTab } from "@/components/admin/experiences-tab";
import { PostsTab } from "@/components/admin/posts-tab";
import type { SiteProfile } from "@/lib/cv/site-data-server";

type Stage = "checking" | "login" | "dashboard";

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
          // Preload profile so the Profile tab can render immediately.
          try {
            const sd = await fetch("/api/site-data", { cache: "no-store" });
            const sdData = await sd.json().catch(() => ({}));
            if (!cancelled && sdData?.profile) setProfile(sdData.profile);
          } catch {
            // Profile tab will fetch on its own.
          }
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
        <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-primary animate-pulse" />
          Đang kiểm tra phiên…
        </div>
      </div>
    );
  }

  if (stage === "login") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <LoginForm
          onSuccess={async () => {
            try {
              const sd = await fetch("/api/site-data", { cache: "no-store" });
              const sdData = await sd.json().catch(() => ({}));
              if (sdData?.profile) setProfile(sdData.profile);
            } catch {
              // ignore
            }
            setStage("dashboard");
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />

      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/15 border border-primary/30 text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <div className="leading-tight">
              <div className="font-mono text-sm font-semibold">admin panel</div>
              <div className="hidden text-[10px] text-muted-foreground sm:block">
                <Terminal className="inline size-2.5 mr-1" />
                quản trị nội dung
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                <span className="hidden sm:inline">Xem trang web</span>
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Tabs defaultValue="profile" className="gap-4">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
            <TabsTrigger value="projects">Dự án</TabsTrigger>
            <TabsTrigger value="experiences">Kinh nghiệm</TabsTrigger>
            <TabsTrigger value="posts">Bài viết</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-4">
            <ProfileTab initial={profile} />
          </TabsContent>
          <TabsContent value="projects" className="mt-4">
            <ProjectsTab />
          </TabsContent>
          <TabsContent value="experiences" className="mt-4">
            <ExperiencesTab />
          </TabsContent>
          <TabsContent value="posts" className="mt-4">
            <PostsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
