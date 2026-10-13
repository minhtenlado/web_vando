"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, ArrowUpRight, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useSiteData } from "./site-data-context";
import { useLocale } from "./locale-context";

export function Navbar() {
  const { settings, profile, posts } = useSiteData();
  const { t, locale, setLocale } = useLocale();
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState("");
  const links = [
    {
      id: "projects",
      label: t("Dự án", "Work"),
      enabled: settings.navProjectsEnabled,
    },
    {
      id: "about",
      label: t("Về mình", "About"),
      enabled: settings.navAboutEnabled,
    },
    {
      id: "skills",
      label: t("Kỹ năng", "Expertise"),
      enabled:
        settings.navSkillsEnabled !== false && profile.skillGroups?.length > 0,
    },
    {
      id: "posts",
      label: t("Bài viết", "Notes"),
      enabled:
        settings.navBlogEnabled !== false &&
        posts.some((post) => post.published),
    },
  ].filter((link) => link.enabled !== false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
    );
    document
      .querySelectorAll("main > section[id]")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <>
      <a href="#main-content" className="pf-skip-link">
        {t("Đến nội dung chính", "Skip to content")}
      </a>
      <header className="pf-header">
        <nav
          className="pf-container pf-navigation"
          aria-label={t("Điều hướng chính", "Main navigation")}
        >
          <Link
            href="/#top"
            className="pf-brand"
            aria-label={t("Phan Huỳnh — Trang chủ", "Phan Huỳnh — Home")}
          >
            <span className="pf-brand-mark">
              ph<span>.</span>
            </span>
            <span>
              phanhuynh<span className="pf-brand-period">.</span>
            </span>
          </Link>
          <div className="pf-desktop-nav">
            {links.map((link) => (
              <Link
                href={`/#${link.id}`}
                key={link.id}
                aria-current={active === link.id ? "location" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pf-nav-tools">
            <button
              className="pf-icon-button pf-command-button"
              aria-label={t("Tìm kiếm (Ctrl+K)", "Search (Ctrl+K)")}
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-command-palette"))
              }
            >
              <Search size={17} />
            </button>
            <button
              className="pf-locale-button"
              onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
              aria-label={
                locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"
              }
            >
              {locale.toUpperCase()}
            </button>
            <button
              className="pf-icon-button"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              aria-label={t("Đổi giao diện sáng/tối", "Toggle color theme")}
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun size={17} />
              ) : (
                <Moon size={17} />
              )}
            </button>
            {settings.navContactEnabled !== false && (
              <button
                className="pf-nav-contact"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("open-contact-modal"))
                }
              >
                {t("Kết nối", "Let’s talk")}
                <ArrowUpRight size={16} />
              </button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="pf-icon-button pf-mobile-menu"
                  aria-label={t("Mở menu", "Open menu")}
                >
                  <Menu size={22} />
                </button>
              </SheetTrigger>
              <SheetContent className="pf-mobile-sheet">
                <SheetTitle>{t("Khám phá", "Explore")}</SheetTitle>
                <div className="pf-mobile-links">
                  {links.map((link) => (
                    <SheetClose asChild key={link.id}>
                      <Link href={`/#${link.id}`}>
                        {link.label}
                        <ArrowUpRight size={20} />
                      </Link>
                    </SheetClose>
                  ))}
                  {settings.navContactEnabled !== false && (
                    <SheetClose asChild>
                      <a href="/#contact">
                        {t("Liên hệ", "Contact")}
                        <ArrowUpRight size={20} />
                      </a>
                    </SheetClose>
                  )}
                </div>
                <p className="pf-mobile-caption">
                  Embedded Systems · IoT · Edge AI
                </p>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>
    </>
  );
}
