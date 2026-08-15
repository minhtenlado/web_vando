import type { Metadata } from "next";
import { Alumni_Sans, Albert_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/cv/theme-provider";
import Script from "next/script";

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

export const metadata: Metadata = {
  title: "Phan Huỳnh Văn Đô — Embedded Software Engineer",
  description:
    "Portfolio CV của Phan Huỳnh Văn Đô, kỹ sư phần mềm nhúng chuyên về hệ thống RTOS, vi điều khiển ARM/STM32/ESP32 và phát triển firmware hiệu năng cao.",
  keywords: [
    "Embedded Engineer",
    "Firmware Developer",
    "STM32",
    "ESP32",
    "RTOS",
    "ARM Cortex",
    "C/C++",
    "IoT",
    "Kỹ sư nhúng",
    "Lập trình nhúng",
  ],
  authors: [{ name: "Phan Huỳnh Văn Đô" }],
  openGraph: {
    title: "Phan Huỳnh Văn Đô — Embedded Software Engineer",
    description:
      "Kỹ sư phần mềm nhúng · RTOS · ARM Cortex · IoT · Firmware Engineering",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phan Huỳnh Văn Đô — Embedded Software Engineer",
    description:
      "Kỹ sư phần mềm nhúng · RTOS · ARM Cortex · IoT · Firmware Engineering",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className="overflow-x-clip">
      <body
        className={`${alumniSans.variable} ${albertSans.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground overflow-x-clip font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2941183923177148"
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
