'use client'

import * as React from "react"
import { Cpu, Github, Linkedin, Mail, ArrowUp } from "lucide-react"
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

  return (
    <footer className="relative border-t border-border/60 bg-muted/20">
      <div className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="md:col-span-2 space-y-4">
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
            <div className="flex gap-3 pt-2">
              <a
                href={`mailto:${profile.email}`}
                className="grid place-items-center h-9 w-9 rounded-md bg-background border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href={`https://${profile.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid place-items-center h-9 w-9 rounded-md bg-background border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href={`https://${profile.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid place-items-center h-9 w-9 rounded-md bg-background border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("Liên kết", "Links")}</h4>
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
            <h4 className="font-semibold mb-4">{t("Khác", "Other")}</h4>
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
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("Bảng lệnh (Cmd+K)", "Command Palette (Cmd+K)")}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 md:mt-16 pt-8 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            &copy; {year} {profile.name}. {t("Tất cả các quyền được bảo lưu.", "All rights reserved.")}
          </p>
          <a
            href="#top"
            onClick={handleScrollTop}
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            {t("Về đầu trang", "Back to top")} <ArrowUp className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  )
}
