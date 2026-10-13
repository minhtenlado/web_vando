import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="pf-site min-h-screen flex flex-col items-center justify-center text-center px-6 py-16">
      <Compass size={54} strokeWidth={1} className="mb-8 text-primary" />
      <p className="pf-eyebrow">404 / PAGE NOT FOUND</p>
      <h1 className="text-4xl sm:text-6xl font-medium tracking-tight">
        Một ngã rẽ mới.
      </h1>
      <p className="mt-5 mb-8 max-w-md text-muted-foreground leading-relaxed">
        Trang này không tồn tại hoặc đã được chuyển đi. Hãy quay về để khám phá
        những dự án mới.
      </p>
      <Link href="/" className="pf-button pf-button-dark">
        Về trang chủ
        <ArrowUpRight size={18} />
      </Link>
    </main>
  );
}
