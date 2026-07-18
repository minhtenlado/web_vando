'use client'

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, Menu, X, Cpu, Download, Search, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { navLinks } from "@/lib/cv/data"
import { useSiteData } from "@/components/cv/site-data-context"
import { useLocale } from "@/components/cv/locale-context"
import { LocaleToggle } from "@/components/cv/locale-toggle"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { profile } = useSiteData()
  const { t, locale } = useLocale()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [active, setActive] = React.useState<string>("#about")

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(() => {
    const sections = navLinks
      .map((l) => document.querySelector(l.href.replace("/", "")))
      .filter(Boolean) as Element[]
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`/#${entry.target.id}`)
        })
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "backdrop-blur-xl bg-background/70 border-b border-border/60 shadow-sm"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <nav className="container mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="#top" className="flex items-center gap-2 group" aria-label={t("Về đầu trang", "Back to top")}>
          <span className="relative grid place-items-center h-9 w-9 rounded-md bg-primary/10 text-primary border border-primary/30">
            <Cpu className="h-5 w-5" />
            <span className="absolute inset-0 rounded-md pulse-ring opacity-0 group-hover:opacity-100" />
          </span>
          <span className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">{"<"}</span>
            {profile.name.split(" ").slice(-1)[0].toLowerCase()}.dev
            <span className="text-primary">{"/>"}</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "link-underline px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  active === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link[locale]}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 no-print">

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
            aria-label={t("Mở bảng lệnh (Cmd+K)", "Open command palette (Cmd+K)")}
            className="hidden sm:inline-flex gap-2 text-muted-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            <kbd className="font-mono text-[10px] rounded border border-border bg-muted px-1 py-0.5">⌘K</kbd>
          </Button>

          <LocaleToggle />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={t("Đổi giao diện sáng/tối", "Toggle theme")}
            className="h-9 w-9"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <Sun className="h-4 w-4 opacity-0" />
            )}
          </Button>

          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href="#contact">
              <Download className="h-4 w-4 mr-1.5" /> {t("Liên hệ", "Contact")}
            </a>
          </Button>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9"
                aria-label={t("Mở menu", "Open menu")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">{t("Menu điều hướng", "Navigation menu")}</SheetTitle>
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-sm text-primary">menu()</span>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>
              <ul className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <SheetClose asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          "block px-3 py-3 rounded-md text-sm font-medium transition-colors",
                          active === link.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {link[locale]}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-border flex flex-col gap-2 no-print">

                <Button asChild className="w-full">
                  <a href="#contact">
                    <Download className="h-4 w-4 mr-1.5" /> {t("Liên hệ ngay", "Contact now")}
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
