import { ThemeProvider } from "@/components/cv/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { getSiteSettings } from "@/lib/cv/site-data-server";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { Manrope } from "next/font/google";
import "../components/cv/engineering-lab.css";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin", "vietnamese"], display: "swap", variable: "--font-lab-sans" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const fallbackTitle = "Engineering Lab | Embedded Systems, Edge AI & Robotics";
  const fallbackDescription = "Technical projects across embedded systems, edge AI, robotics, IoT, hardware, and software.";
  const personalName = /phan\s+hu(?:ỳnh|ynh)\s+v(?:ăn|an)\s+đ(?:ô|o)/i;
  const publicText = (value: unknown, fallback: string) => {
    const text = typeof value === "string" ? value.trim() : "";
    return text && !personalName.test(text) ? text : fallback;
  };
  const title = publicText(settings.metaTitle, fallbackTitle);
  const description = publicText(settings.metaDescription, fallbackDescription);
  const brand = publicText(settings.portfolioName, "Engineering Lab");
  const ogTitle = publicText(settings.ogTitle, title);
  const candidateImage = typeof settings.ogImageUrl === "string" ? settings.ogImageUrl.trim() : "";
  const ogImage = candidateImage.startsWith("/") && !candidateImage.startsWith("//")
    ? candidateImage
    : (() => { try { const url = new URL(candidateImage); return url.protocol === "https:" && (url.hostname === "res.cloudinary.com" || url.hostname.endsWith(".public.blob.vercel-storage.com")) ? url.href : undefined; } catch { return undefined; } })();

  return {
    metadataBase: new URL("https://phanhuynh.id.vn"),
    alternates: {
      canonical: "/",
    },
    title,
    description,
    keywords: [
      "Engineering Lab",
      "Embedded Systems",
      "IoT",
      "Edge AI",
      "Robotics",
      "Firmware",
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: ogTitle,
      description,
      type: "website",
      url: "https://phanhuynh.id.vn",
      siteName: brand,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    other: {
      "google-adsense-account": "ca-pub-2941183923177148",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  return (
    <html
      className={manrope.variable}
      lang={(await cookies()).get("cv-locale")?.value === "en" ? "en" : "vi"}
      suppressHydrationWarning
    >
      <body className="antialiased bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storageKey="engineering-lab-theme-v1"
          enableSystem={false}
          disableTransitionOnChange
        >
          {settings.analyticsEnabled && settings.analyticsId && (
            <>
              <Script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${settings.analyticsId}`}
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.analyticsId}');
                `}
              </Script>
            </>
          )}
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
