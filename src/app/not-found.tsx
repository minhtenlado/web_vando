import Link from "next/link";
import { ArrowLeft, Cpu, Compass, BookOpen, Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080a0d] text-[#e7eaf0] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden font-sans select-none">
      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center space-y-8">
        {/* Radar Icon Illustration */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-25" />
          <div className="absolute inset-2 rounded-full border border-primary/30 animate-pulse opacity-40" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary/20 to-emerald-500/10 border border-primary/40 flex items-center justify-center shadow-xl shadow-primary/10">
            <Cpu className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>

        {/* 404 Headline */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Error 404 · Signal Lost
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Tọa độ không tồn tại
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
            Robot của bạn đã đi lạc ra khỏi bản đồ mô phỏng! Trang web bạn đang tìm kiếm có thể đã được di chuyển hoặc chưa từng tồn tại.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>

          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium text-sm hover:bg-zinc-800 hover:text-white transition-all hover:border-zinc-700"
          >
            <Compass className="w-4 h-4 text-primary" />
            <span>Xem dự án</span>
          </Link>

          <Link
            href="/#posts"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium text-sm hover:bg-zinc-800 hover:text-white transition-all hover:border-zinc-700"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Đọc bài viết</span>
          </Link>
        </div>

        {/* Footer quick hint */}
        <div className="pt-8 border-t border-zinc-800/60 text-xs text-zinc-500 font-mono">
          <span>Phan Huỳnh Văn Đô · Robotics & AIoT Engineering</span>
        </div>
      </div>
    </div>
  );
}
