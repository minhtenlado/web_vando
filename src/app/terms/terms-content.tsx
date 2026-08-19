'use client'

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, Code2, Globe } from "lucide-react";
import { useLocale } from "@/components/cv/locale-context";
import { LocaleToggle } from "@/components/cv/locale-toggle";

export function TermsContent() {
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
            <FileText className="w-3.5 h-3.5" /> {t("Điều khoản dịch vụ", "Terms of Service")}
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
            {t("Điều Khoản Sử Dụng (Terms of Service)", "Terms of Service")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("Cập nhật lần cuối: ", "Last updated: ")}
            <span className="font-mono font-medium text-foreground">{lastUpdated}</span>
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            {t(
              "Chào mừng bạn đến với website của Phan Huỳnh Văn Đô. Bằng việc truy cập hoặc sử dụng trang web này, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.",
              "Welcome to the website of Phan Huynh Van Do. By accessing or using this website, you agree to be bound by the terms and conditions outlined below."
            )}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10 text-muted-foreground leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary shrink-0" />
              {t("1. Quyền Sở hữu Trí tuệ và Nội dung", "1. Intellectual Property Rights & Content")}
            </h2>
            <p>
              {t(
                "Tất cả các bài viết kỹ thuật, tài liệu hướng dẫn, sơ đồ kiến trúc, hình ảnh dự án và mã nguồn được chia sẻ trên website này đều thuộc bản quyền của Phan Huỳnh Văn Đô hoặc các đơn vị/dự án mã nguồn mở có liên quan:",
                "All technical articles, tutorials, system architecture diagrams, project visuals, and source code shared on this website are the intellectual property of Phan Huynh Van Do or referenced open-source projects:"
              )}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                {t(
                  "Bạn được quyền trích dẫn hoặc chia sẻ các bài viết vì mục đích học tập phi thương mại, với điều kiện phải ghi rõ nguồn tác giả và đính kèm đường link dẫn về bài viết gốc trên phanhuynh.id.vn.",
                  "You are granted permission to reference or share articles for non-commercial educational purposes, provided that proper attribution is credited with a direct link to the original article on phanhuynh.id.vn."
                )}
              </li>
              <li>
                {t(
                  "Các đoạn mã nguồn mẫu được chia sẻ theo giấy phép mã nguồn mở (MIT License) trừ khi có ghi chú giấy phép riêng trong từng dự án cụ thể.",
                  "Sample source code snippets are provided under the open-source MIT License unless explicitly stated otherwise in specific project repositories."
                )}
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              {t("2. Trách nhiệm của Người Sử dụng", "2. Acceptable Use Policy")}
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                {t(
                  "Không sử dụng website vào bất kỳ mục đích vi phạm pháp luật, phát tán thư rác hoặc mã độc.",
                  "Do not use this website for any unlawful purpose, spamming, harassment, or transmitting harmful code."
                )}
              </li>
              <li>
                {t(
                  "Không can thiệp, tấn công từ chối dịch vụ hoặc cố ý làm gián đoạn tính toàn vẹn và hoạt động bình thường của hệ thống máy chủ.",
                  "Do not attempt to compromise, probe, disrupt, or launch denial-of-service attacks against the website infrastructure."
                )}
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary shrink-0" />
              {t("3. Tuyên bố Miễn trừ Trách nhiệm", "3. Disclaimer of Warranty")}
            </h2>
            <p>
              {t(
                "Các kiến thức, thuật toán và giải pháp kỹ thuật chia sẻ trên trang web được đúc kết từ kinh nghiệm thực tiễn và nghiên cứu cá nhân. Mặc dù tác giả luôn nỗ lực đảm bảo tính chính xác cao nhất, nội dung được cung cấp trên cơ sở 'nguyên trạng' (as-is) và không cấu thành lời khuyên hoặc bảo đảm pháp lý cho mọi trường hợp thương mại riêng biệt.",
                "Technical tutorials, algorithms, and engineering solutions shared on this website are based on personal research and engineering experience. While best efforts are made to ensure accuracy, all content is provided on an 'as-is' basis without warranties of any kind."
              )}
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-border/40">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary shrink-0" />
              {t("4. Thay đổi Điều khoản & Liên hệ", "4. Modifications & Inquiries")}
            </h2>
            <p>
              {t(
                "Điều khoản này có thể được cập nhật định kỳ để phù hợp với quy định mới. Mọi thắc mắc xin vui lòng liên hệ trực tiếp qua email: ",
                "These Terms of Service may be updated periodically. For questions or permissions, please contact via email: "
              )}
              <a href="mailto:phanhuynhvando@gmail.com" className="text-primary hover:underline font-medium">
                phanhuynhvando@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
