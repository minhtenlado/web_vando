"use client";

import Link from "next/link";
import { ArrowUpRight, Github, Mail, ArrowUp } from "lucide-react";
import { useSiteData } from "./site-data-context";
import { useLocale } from "./locale-context";
import { externalUrl } from "@/lib/cv/presentation";

export function Footer() {
  const { profile, settings } = useSiteData();
  const { t } = useLocale();
  const github = externalUrl(profile.github);
  return (
    <footer className="pf-footer">
      <div className="pf-container">
        <div className="pf-footer-top">
          <div>
            <Link href="/#top" className="pf-brand">
              <span className="pf-brand-mark">E<span>L</span></span>
              <span>{settings.portfolioName || "ENGINEERING LAB"}</span>
            </Link>
            <p>
              {t(
                settings.portfolioTagline || "Dự án phần cứng, phần mềm và hệ thống nhúng.",
                settings.portfolioTagline || "Hardware, software, and embedded systems projects.",
              )}
            </p>
          </div>
          <div className="pf-footer-links">
            {profile.email && (
              <a href={`mailto:${profile.email}`}>
                <Mail size={16} />
                Email
                <ArrowUpRight size={14} />
              </a>
            )}
            {github && (
              <a href={github} target="_blank" rel="noopener noreferrer">
                <Github size={16} />
                GitHub
                <ArrowUpRight size={14} />
              </a>
            )}
            {settings.sectionNotesEnabled !== false && <Link href="/notes">{t("Ghi chú kỹ thuật", "Engineering notes")}</Link>}
          </div>
        </div>
        <div className="pf-footer-bottom">
          <span>
            © {new Date().getFullYear()} Engineering Lab
          </span>
          <div>
            <Link href="/privacy">{t("Bảo mật", "Privacy")}</Link>
            <Link href="/terms">{t("Điều khoản", "Terms")}</Link>
            <Link href="/#top" className="pf-back-top">
              {t("Về đầu trang", "Back to top")}
              <ArrowUp size={14} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
