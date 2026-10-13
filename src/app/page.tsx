import { cookies } from "next/headers";
import { getSiteData } from "@/lib/cv/site-data-server";
import { SiteDataProvider } from "@/components/cv/site-data-context";
import { LocaleProvider } from "@/components/cv/locale-context";
import { PortfolioHome } from "@/components/cv/portfolio-home";
import { toPresentationData } from "@/lib/cv/site-presentation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("cv-locale")?.value === "en" ? "en" : "vi";
  const initialData = toPresentationData(await getSiteData(locale));
  return (
    <LocaleProvider initialLocale={locale}>
      <SiteDataProvider initialData={initialData}>
        <PortfolioHome />
      </SiteDataProvider>
    </LocaleProvider>
  );
}
