import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="lab-site"><main className="lab-container lab-route-error" id="main-content">
      <p className="lab-eyebrow">404 / PAGE NOT FOUND</p>
      <h1>Không tìm thấy trang.</h1>
      <p>
        Trang này không tồn tại hoặc đã được chuyển đi. Hãy quay về để khám phá
        những dự án mới.
      </p>
      <Link href="/" className="lab-button lab-button-primary">
        Về trang chủ
        <ArrowUpRight size={18} />
      </Link>
    </main></div>
  );
}
