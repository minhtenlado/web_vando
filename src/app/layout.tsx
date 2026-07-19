import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/cv/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  icons: {
    icon: "/uploads/avatar.jpg",
  },
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
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground overflow-x-clip`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
