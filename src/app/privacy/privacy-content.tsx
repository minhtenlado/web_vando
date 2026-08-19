'use client'

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Cookie, Globe, Server } from "lucide-react";
import { useLocale } from "@/components/cv/locale-context";
import { LocaleToggle } from "@/components/cv/locale-toggle";

export function PrivacyContent() {
  const { locale, t } = useLocale();
  const lastUpdated = locale === "en" ? "August 19, 2026" : "19/08/2026";

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-4 sm:px-8 bg-background/85 border-b border-border/40 backdrop-blur-xl">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("Về trang chủ", "Back to home")}</span>
        </Link>

        {/* Right Corner: Badge + Language Toggle */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5" /> {t("Chính sách bảo mật", "Privacy Policy")}
          </span>
          <div className="flex items-center gap-2 pl-2 border-l border-border/40">
            <span className="text-xs text-muted-foreground font-mono uppercase">{locale}</span>
            <LocaleToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 pb-24">
        {/* Title & Metadata */}
        <div className="space-y-4 mb-10 pb-8 border-b border-border/40">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {t("Chính Sách Bảo Mật (Privacy Policy)", "Privacy Policy")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("Cập nhật lần cuối: ", "Last updated: ")}
            <span className="font-mono font-medium text-foreground">{lastUpdated}</span>
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            {t(
              "Chào mừng bạn đến với website thông tin cá nhân và blog công nghệ của Phan Huỳnh Văn Đô (tại địa chỉ phanhuynh.id.vn). Tôi cam kết bảo vệ quyền riêng tư và sự an toàn dữ liệu của tất cả người truy cập.",
              "Welcome to the personal portfolio and technology blog of Phan Huynh Van Do (hosted at phanhuynh.id.vn). We are committed to protecting your privacy and ensuring the security of your personal information."
            )}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10 text-muted-foreground leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary shrink-0" />
              {t("1. Dữ liệu thu thập và Mục đích sử dụng", "1. Information We Collect and How We Use It")}
            </h2>
            <p>
              {t(
                "Khi bạn truy cập và sử dụng website, chúng tôi có thể thu thập một số thông tin kỹ thuật cơ bản nhằm nâng cao trải nghiệm người dùng:",
                "When you visit and browse our website, we may collect certain information to improve user experience and deliver quality content:"
              )}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>{t("Thông tin liên hệ tự nguyện:", "Voluntary Contact Details:")}</strong>{" "}
                {t(
                  "Họ tên, địa chỉ Email và nội dung tin nhắn khi bạn chủ động gửi tin nhắn qua biểu mẫu liên hệ (Contact Form). Dữ liệu này chỉ dùng duy nhất cho mục đích phản hồi trực tiếp cho bạn.",
                  "Your name, email address, and message content when you voluntarily reach out via the contact form. This information is solely used to respond to your inquiries."
                )}
              </li>
              <li>
                <strong>{t("Dữ liệu phân tích ẩn danh:", "Anonymous Analytics Data:")}</strong>{" "}
                {t(
                  "Lượt xem trang, thời gian đọc bài viết, loại thiết bị và trình duyệt thông qua hệ thống đo lường ẩn danh để tối ưu hóa tốc độ tải và hiệu suất trang web.",
                  "Page views, reading duration, device type, and browser metrics collected anonymously to optimize website speed, responsiveness, and performance."
                )}
              </li>
            </ul>
          </section>

          {/* Section 2: Cookie & Google AdSense Compliance */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Cookie className="w-5 h-5 text-primary shrink-0" />
              {t(
                "2. Cookie và Dịch vụ Quảng cáo của Bên Thứ Ba (Google AdSense)",
                "2. Cookies and Third-Party Advertising (Google AdSense Compliance)"
              )}
            </h2>
            <p>
              {t(
                "Website có sử dụng Cookie và các công nghệ theo dõi tương tự từ các đối tác thứ ba uy tín:",
                "Our website uses cookies and similar technologies from trusted third-party partners:"
              )}
            </p>
            <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
              <p className="font-semibold text-foreground">
                {t("Tuân thủ chính sách Google AdSense:", "Google AdSense Policy Disclosure:")}
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  {t(
                    "Các nhà cung cấp bên thứ ba, bao gồm Google, sử dụng cookie để phân phát quảng cáo dựa trên các lượt truy cập trước đó của người dùng vào trang web này hoặc các trang web khác trên Internet.",
                    "Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites across the Internet."
                  )}
                </li>
                <li>
                  {t(
                    "Việc sử dụng cookie quảng cáo của Google cho phép Google và các đối tác của họ phân phát quảng cáo phù hợp tới bạn dựa trên lượt truy cập vào các trang web trên Internet.",
                    "Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to your sites and/or other sites on the Internet."
                  )}
                </li>
                <li>
                  {t(
                    "Bạn có thể chọn không tham gia quảng cáo được cá nhân hóa bằng cách truy cập ",
                    "Users may opt out of personalized advertising by visiting "
                  )}
                  <a
                    href="https://adssettings.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80 font-medium"
                  >
                    Google Ads Settings
                  </a>
                  {t(
                    " hoặc thông qua trang web ",
                    " or through "
                  )}
                  <a
                    href="https://www.aboutads.info"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80 font-medium"
                  >
                    aboutads.info
                  </a>.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary shrink-0" />
              {t("3. Bảo mật Thông tin", "3. Information Security")}
            </h2>
            <p>
              {t(
                "Chúng tôi áp dụng các tiêu chuẩn an ninh mạng hiện đại (HTTPS mã hóa SSL/TLS, Content Security Policy, chống tấn công XSS/CSRF, bảo mật Cookie HttpOnly/SameSite) để đảm bảo dữ liệu kết nối luôn được bảo vệ an toàn.",
                "We implement industry-standard cybersecurity measures (HTTPS SSL/TLS encryption, Content Security Policy, strict XSS/CSRF mitigations, HttpOnly/SameSite cookies) to ensure all connections and transmissions remain secure."
              )}
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary shrink-0" />
              {t("4. Quyền của Người Dùng", "4. User Privacy Rights")}
            </h2>
            <p>
              {t(
                "Bạn hoàn toàn có quyền yêu cầu xóa bất kỳ thông tin tin nhắn liên hệ nào bạn đã gửi hoặc tắt tính năng lưu trữ Cookie trực tiếp trong phần cài đặt trình duyệt của bạn bất cứ lúc nào.",
                "You retain full rights to request the deletion of any contact messages you have submitted, or to disable and clear cookies directly within your web browser settings at any time."
              )}
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-6 border-t border-border/40">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Server className="w-5 h-5 text-primary shrink-0" />
              {t("5. Liên hệ với tác giả", "5. Contact Information")}
            </h2>
            <p>
              {t(
                "Nếu bạn có bất kỳ câu hỏi nào liên quan đến Chính sách bảo mật này, xin vui lòng liên hệ qua:",
                "If you have any questions or inquiries regarding this Privacy Policy, please feel free to reach out via:"
              )}
            </p>
            <div className="font-mono text-sm p-4 rounded-xl bg-muted/40 border border-border/40 space-y-1.5">
              <p><strong>Phan Huỳnh Văn Đô</strong></p>
              <p>Email: <a href="mailto:phanhuynhvando@gmail.com" className="text-primary hover:underline">phanhuynhvando@gmail.com</a></p>
              <p>Website: <a href="https://phanhuynh.id.vn" className="text-primary hover:underline">https://phanhuynh.id.vn</a></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
