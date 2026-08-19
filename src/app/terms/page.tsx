import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, Code2, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ (Terms of Service) — Phan Huỳnh Văn Đô",
  description: "Điều khoản sử dụng và quyền sở hữu trí tuệ trên website phanhuynh.id.vn của Phan Huỳnh Văn Đô.",
  openGraph: {
    title: "Điều khoản dịch vụ — Phan Huỳnh Văn Đô",
    description: "Điều khoản sử dụng website phanhuynh.id.vn",
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = "19/08/2026";

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-4 sm:px-8 bg-background/80 border-b border-border/40 backdrop-blur-xl">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <FileText className="w-3.5 h-3.5" /> Terms of Service
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 pb-24">
        <div className="space-y-4 mb-10 pb-8 border-b border-border/40">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Điều Khoản Sử Dụng (Terms of Service)
          </h1>
          <p className="text-sm text-muted-foreground">
            Cập nhật lần cuối: <span className="font-mono font-medium text-foreground">{lastUpdated}</span>
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Chào mừng bạn đến với website của <strong className="text-foreground">Phan Huỳnh Văn Đô</strong>. Bằng việc truy cập hoặc sử dụng trang web này, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.
          </p>
        </div>

        <div className="space-y-10 text-muted-foreground leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary shrink-0" />
              1. Quyền Sở hữu Trí tuệ và Nội dung
            </h2>
            <p>
              Tất cả các bài viết kỹ thuật, tài liệu hướng dẫn, sơ đồ kiến trúc, hình ảnh dự án và mã nguồn được chia sẻ trên website này đều thuộc bản quyền của <strong>Phan Huỳnh Văn Đô</strong> hoặc các đơn vị/dự án mã nguồn mở có liên quan:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Bạn được quyền trích dẫn hoặc chia sẻ các bài viết vì mục đích học tập phi thương mại, với điều kiện phải ghi rõ nguồn và đính kèm link dẫn về bài viết gốc trên <span className="font-mono text-primary">phanhuynh.id.vn</span>.</li>
              <li>Các đoạn mã nguồn mẫu được chia sẻ theo giấy phép mã nguồn mở (MIT License) trừ khi có ghi chú khác.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              2. Trách nhiệm của Người Sử dụng
            </h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Không sử dụng website vào bất kỳ mục đích vi phạm pháp luật hoặc phát tán mã độc.</li>
              <li>Không can thiệp hoặc cố ý làm gián đoạn tính toàn vẹn và hoạt động bình thường của hệ thống máy chủ.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary shrink-0" />
              3. Tuyên bố Miễn trừ Trách nhiệm
            </h2>
            <p>
              Các kiến thức, thuật toán và giải pháp kỹ thuật chia sẻ trên trang web được đúc kết từ kinh nghiệm thực tiễn và nghiên cứu cá nhân. Mặc dù tôi luôn nỗ lực đảm bảo tính chính xác cao nhất, nội dung được cung cấp trên cơ sở &quot;nguyên trạng&quot; (as-is) và không phải là bảo đảm pháp lý cho mọi trường hợp triển khai thương mại riêng biệt.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-border/40">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary shrink-0" />
              4. Thay đổi Điều khoản & Liên hệ
            </h2>
            <p>
              Điều khoản này có thể được cập nhật định kỳ để phù hợp với quy định mới. Mọi thắc mắc xin vui lòng liên hệ trực tiếp qua email: <a href="mailto:phanhuynhvando@gmail.com" className="text-primary hover:underline font-medium">phanhuynhvando@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
