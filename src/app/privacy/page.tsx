import { Metadata } from "next";
import { cookies } from "next/headers";
import { LocaleProvider } from "@/components/cv/locale-context";
import { PrivacyContent } from "./privacy-content";

export const metadata: Metadata = {
  title: "Chính sách bảo mật (Privacy Policy) — Phan Huỳnh Văn Đô",
  description: "Chính sách bảo mật và quyền riêng tư của website phanhuynh.id.vn. Cam kết minh bạch về thu thập dữ liệu và tuân thủ Google AdSense.",
  openGraph: {
    title: "Chính sách bảo mật (Privacy Policy) — Phan Huỳnh Văn Đô",
    description: "Chính sách bảo mật và quyền riêng tư của website phanhuynh.id.vn",
  },
};

export default async function PrivacyPolicyPage() {
  const cookieStore = await cookies();
  const initialLocale = cookieStore.get("cv-locale")?.value || "vi";

  return (
    <LocaleProvider initialLocale={initialLocale}>
      <PrivacyContent />
    </LocaleProvider>
  );
}
