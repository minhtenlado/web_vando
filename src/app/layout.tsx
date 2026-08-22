import type { Metadata } from "next";
import { Alumni_Sans, Albert_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/cv/theme-provider";
import Script from "next/script";
import { getSiteData } from "@/lib/cv/site-data-server";

const alumniSans = Alumni_Sans({
  variable: "--font-alumni-sans",
  subsets: ["latin"],
  weight: ["100", "300", "400"],
});

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const data = await getSiteData("vi");
  const settings = data.profile.settings || {};
  const name = data.profile.name || "Phan Huỳnh Văn Đô";

  return {
    metadataBase: new URL("https://phanhuynh.id.vn"),
    alternates: {
      canonical: "/",
    },
    title: settings.title || name,
    description: settings.description,
    keywords: settings.keywords,
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
      title: settings.title || name,
      description: settings.description,
      type: "website",
      url: "https://phanhuynh.id.vn",
      siteName: name,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.title || name,
      description: settings.description,
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
    <html lang="vi" suppressHydrationWarning className="overflow-x-clip">
      <body
        className={`${alumniSans.variable} ${albertSans.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground overflow-x-clip font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={settings.darkMode === false ? "light" : "dark"}
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
