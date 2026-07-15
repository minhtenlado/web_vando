'use client'

import * as React from "react"
import { Cpu, Github, Linkedin, Mail, ArrowUp } from "lucide-react"
import { navLinks } from "@/lib/cv/data"
import { useSiteData } from "@/components/cv/site-data-context"

export function Footer() {
  const { profile } = useSiteData()
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-auto border-t border-border bg-background/60 backdrop-blur">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center h-9 w-9 rounded-md bg-primary/10 text-primary border border-primary/30">
                <Cpu className="h-5 w-5" />
              </span>
              <span className="font-mono text-sm font-semibold">
                <span className="text-primary">{"<"}</span>
                {profile.name.split(" ").slice(-1)[0].toLowerCase()}.dev
                <span className="text-primary">{"/>"}</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {profile.role} — {profile.tagline}. Luôn sẵn sàng cho những dự án
              phần cứng thông minh và hệ thống nhúng hiệu năng cao.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-3">{"//"} navigation</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-3">{"//"} connect</p>
            <div className="flex flex-col gap-2">
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" /> Email
              </a>
              <a
                href={`https://${profile.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-4 w-4" /> GitHub
              </a>
              <a
                href={`https://${profile.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-mono text-center sm:text-left">
            © {year} {profile.name}. Built with Next.js, TypeScript & shadcn/ui.
          </p>
          <a
            href="#top"
            className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
            aria-label="Về đầu trang"
          >
            <span className="grid place-items-center h-7 w-7 rounded-md border border-border hover:border-primary/40 transition-colors">
              <ArrowUp className="h-3.5 w-3.5" />
            </span>
            back_to_top()
          </a>
        </div>
      </div>
    </footer>
  )
}
