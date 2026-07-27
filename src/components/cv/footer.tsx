'use client'

import * as React from "react"
import { motion } from "framer-motion"
import {
  Cpu,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  ArrowUp,
} from "lucide-react"
import { SectionHeader } from "./section-header"
import { Card } from "@/components/ui/card"
import { navLinks } from "@/lib/cv/data"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"

export function Footer() {
  const { profile } = useSiteData()
  const { t, locale } = useLocale()
  const year = new Date().getFullYear()

  const handleScrollTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: "smooth" })
    history.pushState(null, "", "#top")
  }

  const channels = [
    { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { icon: Phone, label: t("Điện thoại", "Phone"), value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: t("Vị trí", "Location"), value: profile.location, href: undefined },
    { icon: Globe, label: "Website", value: profile.website, href: `https://${profile.website}` },
  ]

  const SocialIcon = ({ platform, className }: { platform: string, className?: string }) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook className={className} />
      case "instagram":
        return <Instagram className={className} />
      case "linkedin":
        return <Linkedin className={className} />
      case "github":
        return <Github className={className} />
      case "youtube":
        return <Youtube className={className} />
      case "threads":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12a9 9 0 0 0 3 6.83" />
            <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
            <path d="M16 12v1.5a2.5 2.5 0 0 1-5 0V12" />
          </svg>
        )
      case "zalo":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            <text x="12" y="15.5" textAnchor="middle" fontSize="11" fontWeight="bold" stroke="none" fill="currentColor">Z</text>
          </svg>
        )
      default:
        return <Globe className={className} />
    }
  }

  const enabledSocials = profile.socials?.filter((s: any) => s.enabled) || []

  return (
    <footer id="contact" className="relative border-t border-border/60 bg-muted/20 pt-16 lg:pt-24 pb-12">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        {/* Section Header for Contact */}
        <SectionHeader
          index="09 / contact"
          title={t("Liên hệ với tôi", "Contact Me")}
          subtitle={t(
            "Đang tìm kiếm một kỹ sư nhúng cho dự án của bạn, hoặc đơn giản muốn trao đổi về vi điều khiển, RTOS và IoT? Hãy kết nối với tôi.",
            "Looking for an embedded engineer for your project, or just want to chat about microcontrollers, RTOS, and IoT? Let's connect."
          )}
        />

        {/* Contact Cards Grid */}
        <div className="mt-10 mb-16 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Left Col: Channels */}
            <Card className="p-6 sm:p-8 border-border/60 bg-card/40 backdrop-blur flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-6">{t("Kênh liên lạc", "Channels")}</h3>
              <ul className="space-y-5">
                {channels.map((c) => {
                  const Icon = c.icon
                  const content = (
                    <div className="flex items-center gap-4 group">
                      <span className="grid place-items-center h-12 w-12 rounded-xl bg-background border border-border group-hover:border-primary/40 group-hover:text-primary transition-colors shadow-sm shrink-0">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-0.5">{c.label}</p>
                        <p className="text-sm sm:text-base font-medium break-all sm:break-words leading-snug">{c.value}</p>
                      </div>
                    </div>
                  )
                  return (
                    <li key={c.label}>
                      {c.href ? (
                        <a href={c.href} className="block hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </li>
                  )
                })}
              </ul>
            </Card>

            {/* Right Col: Status and Socials */}
            <div className="flex flex-col gap-6">
              <Card className="p-6 sm:p-8 border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inset-0 rounded-full bg-primary opacity-75 pulse-ring" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                  </span>
                  <p className="font-mono text-sm text-primary font-medium tracking-wide uppercase">
                    {t("Hiện tại", "Status")}
                  </p>
                </div>
                <p className="text-base leading-relaxed text-foreground/90">
                  {t(
                    "Tôi hiện đang mở cho các cơ hội freelance, hợp đồng dự án hoặc vị trí toàn thời gian liên quan đến firmware, IoT và hệ thống nhúng.",
                    "I am currently open to freelance opportunities, project contracts, or full-time positions related to firmware, IoT, and embedded systems."
                  )}
                </p>
              </Card>

              <Card className="p-6 sm:p-8 border-border/60 bg-card/40 backdrop-blur">
                <h3 className="text-lg font-bold mb-4">{t("Mạng xã hội", "Socials")}</h3>
                <div className="flex flex-wrap gap-4">
                  {enabledSocials.map((s: any) => (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      className="flex-1 min-w-[3rem] grid place-items-center h-12 rounded-xl bg-background border border-border hover:border-primary/40 hover:text-primary transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <SocialIcon platform={s.platform} className="h-5 w-5" />
                    </a>
                  ))}
                  {enabledSocials.length === 0 && (
                    <p className="text-sm text-muted-foreground w-full text-center py-2">
                      {t("Chưa có mạng xã hội nào được bật.", "No social links enabled yet.")}
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Footer Navigation & Copyright */}
        <div className="pt-10 border-t border-border/60 grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="md:col-span-2 space-y-3 sm:space-y-4">
            <a
              href="#top"
              onClick={handleScrollTop}
              className="inline-flex items-center gap-2 group"
              aria-label={t("Về đầu trang", "Back to top")}
            >
              <span className="grid place-items-center h-8 w-8 rounded bg-primary/10 text-primary border border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Cpu className="h-4 w-4" />
              </span>
              <span className="font-semibold text-lg tracking-tight">
                {profile.name}
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {profile.tagline}
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t("Liên kết", "Links")}</h4>
              <ul className="space-y-2.5">
                {navLinks.slice(0, 4).map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link[locale]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t("Khác", "Other")}</h4>
              <ul className="space-y-2.5">
                {navLinks.slice(4).map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link[locale]}
                    </a>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {t("Bảng lệnh (Cmd+K)", "Command Palette (Cmd+K)")}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          <p>
            &copy; {year} {profile.name}. {t("Tất cả các quyền được bảo lưu.", "All rights reserved.")}
          </p>
          <a
            href="#top"
            onClick={handleScrollTop}
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors shrink-0"
          >
            {t("Về đầu trang", "Back to top")} <ArrowUp className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  )
}
