'use client'

import * as React from "react"
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
    <footer id="contact" className="relative border-t border-border/60 bg-muted/20 py-12 lg:py-16">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: Profile & Social Icons */}
          <div className="space-y-3 sm:space-y-4">
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
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              {profile.tagline}
            </p>

            {/* Social Icons Row */}
            <div className="flex flex-wrap gap-2 pt-1">
              {enabledSocials.map((s: any) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="grid place-items-center h-8 w-8 rounded-md bg-background border border-border hover:border-primary/50 hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <SocialIcon platform={s.platform} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Direct Contact Details */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-foreground">{t("Liên hệ", "Contact")}</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              {profile.email && (
                <li>
                  <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 hover:text-primary transition-colors break-all">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{profile.email}</span>
                  </a>
                </li>
              )}
              {profile.phone && (
                <li>
                  <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{profile.phone}</span>
                  </a>
                </li>
              )}
              {profile.location && (
                <li className="inline-flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                  <span className="leading-snug">{profile.location}</span>
                </li>
              )}
              {profile.website && (
                <li>
                  <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                    <Globe className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{profile.website}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Links */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-foreground">{t("Liên kết", "Links")}</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              {navLinks.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {link[locale]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Other */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-foreground">{t("Khác", "Other")}</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              {navLinks.slice(4).map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {link[locale]}
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
                  className="hover:text-foreground transition-colors text-left"
                >
                  {t("Bảng lệnh (Cmd+K)", "Command Palette (Cmd+K)")}
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
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
