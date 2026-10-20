"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ArrowUpRight, Search, Github } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useSiteData } from "./site-data-context";
import { useLocale } from "./locale-context";
import { externalUrl } from "@/lib/cv/presentation";

export function Navbar() {
  const { profile, posts, settings } = useSiteData();
  const { t, locale, setLocale } = useLocale();
  const pathname = usePathname();
  const [active, setActive] = useState("");
  const github = externalUrl(profile.github);
  const links = [
    {
      id: "projects",
      label: t("Dự án", "Projects"),
      enabled: settings.sectionProjectsEnabled !== false,
    },
    {
      id: "notes",
      label: t("Bài viết", "Notes"),
      enabled:
        settings.sectionNotesEnabled !== false && settings.navBlogEnabled !== false && posts.some((post) => post.published),
    },
  ].filter((link) => link.enabled !== false);

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
            aria-label={t("Engineering Lab — Trang chủ", "Engineering Lab — Home")}
          >
            <span className="pf-brand-mark">
              E<span>L</span>
            </span>
            <span>{settings.portfolioName || "ENGINEERING LAB"}</span>
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
            {github && <a href={github} target="_blank" rel="noopener noreferrer"><Github size={14} /> GitHub</a>}
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
                  {github && (
                    <SheetClose asChild>
                      <a href={github} target="_blank" rel="noopener noreferrer">
                        GitHub
                        <ArrowUpRight size={20} />
                      </a>
                    </SheetClose>
                  )}
                </div>
                <p className="pf-mobile-caption">
                  Embedded systems · IoT · Edge AI · Robotics
                </p>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>
    </>
  );
}
