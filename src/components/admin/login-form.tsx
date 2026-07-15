"use client";

import * as React from "react";
import { Lock, Loader2, ShieldCheck, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const msg = data?.message || "Đăng nhập thất bại.";
        setError(msg);
        toast({ title: "Đăng nhập thất bại", description: msg, variant: "destructive" });
        return;
      }
      toast({ title: "Đăng nhập thành công", description: "Chào mừng đến với admin panel." });
      onSuccess();
    } catch {
      const msg = "Lỗi kết nối. Vui lòng thử lại.";
      setError(msg);
      toast({ title: "Lỗi", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background layers matching the site */}
      <div className="absolute inset-0 bg-grid pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      <Card className="relative w-full max-w-md glow-emerald bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <Terminal className="size-4 text-primary" />
            <span>admin@portfolio:~$ ./login</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 text-primary">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Admin Panel</CardTitle>
              <CardDescription>Nhập mật khẩu để truy cập khu vực quản trị.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider">
                Mật khẩu
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="pl-9 font-mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang xác thực…
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  Đăng nhập
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground font-mono">
              Session được lưu 7 ngày · httpOnly cookie
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
