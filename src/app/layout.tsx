import type { Metadata } from "next";
import { Manrope, Lora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./portfolio.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/cv/theme-provider";
import Script from "next/script";
import { getSiteData } from "@/lib/cv/site-data-server";
import { cookies } from "next/headers";

const manrope = Manrope({
  variable: "--font-geist-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});
const editorial = Lora({
  variable: "--font-editorial",
  subsets: ["latin", "vietnamese"],
  style: "italic",
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale =
    (await cookies()).get("cv-locale")?.value === "en" ? "en" : "vi";
  const data = await getSiteData(locale);
  const settings = data.profile.settings || {};
  const name = data.profile.name || "Phan Huỳnh Văn Đô";
  const title = settings.metaTitle || `${name} — Embedded Systems & Edge AI`;
  const description =
    settings.metaDescription ||
    "Embedded systems, IoT, robotics, and Edge AI. Explore the projects and technical notes of Phan Huỳnh Văn Đô.";

  return {
    metadataBase: new URL("https://phanhuynh.id.vn"),
    alternates: {
      canonical: "/",
    },
    title,
    description,
    keywords: settings.keywords || [
      "Phan Huỳnh Văn Đô",
      "Embedded Systems",
      "IoT",
      "Edge AI",
      "Robotics",
      "Firmware",
    ],
    authors: [{ name }],
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
      title,
      description,
      type: "website",
      url: "https://phanhuynh.id.vn",
      siteName: name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
  const data = await getSiteData("vi");
  const settings = data.profile.settings || {};
  return (
    <html
      lang={(await cookies()).get("cv-locale")?.value === "en" ? "en" : "vi"}
      suppressHydrationWarning
      className={`${manrope.variable} ${editorial.variable} ${jetbrainsMono.variable} overflow-x-clip`}
    >
      <body className="antialiased bg-background text-foreground overflow-x-clip font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          storageKey="phanhuynh-theme-v2"
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
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2941183923177148"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
