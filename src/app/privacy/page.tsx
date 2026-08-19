import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Cookie, Globe, Server, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Chính sách bảo mật (Privacy Policy) — Phan Huỳnh Văn Đô",
  description: "Chính sách bảo mật và quyền riêng tư của website phanhuynh.id.vn. Cam kết minh bạch về thu thập dữ liệu và tuân thủ Google AdSense.",
  openGraph: {
    title: "Chính sách bảo mật — Phan Huỳnh Văn Đô",
    description: "Chính sách bảo mật và quyền riêng tư của website phanhuynh.id.vn",
  },
};

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy Policy
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 pb-24">
        <div className="space-y-4 mb-10 pb-8 border-b border-border/40">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Chính Sách Bảo Mật (Privacy Policy)
          </h1>
          <p className="text-sm text-muted-foreground">
            Cập nhật lần cuối: <span className="font-mono font-medium text-foreground">{lastUpdated}</span>
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Chào mừng bạn đến với trang thông tin cá nhân và blog công nghệ của <strong className="text-foreground">Phan Huỳnh Văn Đô</strong> (tại địa chỉ website <span className="font-mono text-primary">phanhuynh.id.vn</span>). Tôi cam kết bảo vệ quyền riêng tư và sự an toàn dữ liệu của tất cả người truy cập.
          </p>
        </div>

        <div className="space-y-10 text-muted-foreground leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary shrink-0" />
              1. Dữ liệu thu thập và Mục đích sử dụng
            </h2>
            <p>
              Khi bạn truy cập và sử dụng website, chúng tôi có thể thu thập một số thông tin kỹ thuật cơ bản nhằm nâng cao trải nghiệm người dùng:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Thông tin liên hệ tự nguyện:</strong> Tên, địa chỉ Email và nội dung tin nhắn khi bạn chủ động gửi tin nhắn qua biểu mẫu liên hệ (Contact Form). Dữ liệu này chỉ dùng để phản hồi trực tiếp cho bạn.</li>
              <li><strong>Dữ liệu phân tích ẩn danh:</strong> Số lượt xem trang, thời gian đọc bài viết, loại thiết bị và trình duyệt thông qua hệ thống đo lường ẩn danh để tối ưu hóa hiệu suất trang web.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Cookie className="w-5 h-5 text-primary shrink-0" />
              2. Cookie và Dịch vụ Quảng cáo của Bên Thứ Ba (Google AdSense)
            </h2>
            <p>
              Website có sử dụng Cookie và các công nghệ theo dõi tương tự từ các đối tác thứ ba uy tín:
            </p>
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
              <p className="font-semibold text-foreground">Tuân thủ chính sách Google AdSense:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Các nhà cung cấp bên thứ ba, bao gồm Google, sử dụng cookie để phân phát quảng cáo dựa trên các lượt truy cập trước đó của người dùng vào trang web này hoặc các trang web khác trên Internet.</li>
                <li>Việc sử dụng cookie quảng cáo của Google cho phép Google và các đối tác của họ phân phát quảng cáo phù hợp tới bạn dựa trên lượt truy cập vào các trang web trên Internet.</li>
                <li>Bạn có thể chọn không tham gia quảng cáo được cá nhân hóa bằng cách truy cập <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Cài đặt quảng cáo của Google (Google Ads Settings)</a>.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary shrink-0" />
              3. Bảo mật Thông tin
            </h2>
            <p>
              Chúng tôi áp dụng các tiêu chuẩn an ninh mạng hiện đại (HTTPS mã hóa SSL/TLS, Content Security Policy, chống tấn công XSS/CSRF, bảo mật Cookie HttpOnly) để đảm bảo dữ liệu kết nối luôn được an toàn tuyệt đối.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary shrink-0" />
              4. Quyền của Người Dùng
            </h2>
            <p>
              Bạn hoàn toàn có quyền yêu cầu xóa bất kỳ thông tin tin nhắn liên hệ nào bạn đã gửi hoặc tắt tính năng lưu trữ Cookie trực tiếp trên trình duyệt của bạn bất cứ lúc nào.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-6 border-t border-border/40">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Server className="w-5 h-5 text-primary shrink-0" />
              5. Liên hệ với tác giả
            </h2>
            <p>
              Nếu bạn có bất kỳ câu hỏi nào liên quan đến Chính sách bảo mật này, xin vui lòng liên hệ qua:
            </p>
            <div className="font-mono text-sm p-4 rounded-xl bg-muted/40 border border-border/40 space-y-1">
              <p>Họ tên: <strong>Phan Huỳnh Văn Đô</strong></p>
              <p>Email: <a href="mailto:phanhuynhvando@gmail.com" className="text-primary hover:underline">phanhuynhvando@gmail.com</a></p>
              <p>Website: <a href="https://phanhuynh.id.vn" className="text-primary hover:underline">https://phanhuynh.id.vn</a></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
