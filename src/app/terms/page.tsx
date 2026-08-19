import { Metadata } from "next";
import { cookies } from "next/headers";
import { LocaleProvider } from "@/components/cv/locale-context";
import { TermsContent } from "./terms-content";

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ (Terms of Service) — Phan Huỳnh Văn Đô",
  description: "Điều khoản sử dụng và quyền sở hữu trí tuệ trên website phanhuynh.id.vn của Phan Huỳnh Văn Đô.",
  openGraph: {
    title: "Điều khoản dịch vụ (Terms of Service) — Phan Huỳnh Văn Đô",
    description: "Điều khoản sử dụng website phanhuynh.id.vn",
  },
};

export default async function TermsOfServicePage() {
  const cookieStore = await cookies();
  const initialLocale = cookieStore.get("cv-locale")?.value || "vi";

  return (
    <LocaleProvider initialLocale={initialLocale}>
      <TermsContent />
    </LocaleProvider>
  );
}
