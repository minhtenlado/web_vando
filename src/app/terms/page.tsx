import { Metadata } from "next";
import { cookies } from "next/headers";
import { LocaleProvider } from "@/components/cv/locale-context";
import { TermsContent } from "./terms-content";

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ (Terms of Service) — Engineering Lab",
  description: "Điều khoản sử dụng và quyền sở hữu trí tuệ trên website Engineering Lab tại phanhuynh.id.vn.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Điều khoản dịch vụ (Terms of Service) — Engineering Lab",
    description: "Điều khoản sử dụng website phanhuynh.id.vn",
    url: "https://phanhuynh.id.vn/terms",
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
