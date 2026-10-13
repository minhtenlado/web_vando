"use client";

import Link from "next/link";
import { ArrowUpRight, Github, Linkedin, Mail, ArrowUp } from "lucide-react";
import { useSiteData } from "./site-data-context";
import { useLocale } from "./locale-context";
import { externalUrl } from "@/lib/cv/presentation";

export function Footer() {
  const { profile } = useSiteData();
  const { t } = useLocale();
  const github = externalUrl(profile.github);
  const linkedin = externalUrl(profile.linkedin);
  return (
    <footer className="pf-footer">
      <div className="pf-container">
        <div className="pf-footer-top">
          <div>
            <Link href="/#top" className="pf-brand">
              <span className="pf-brand-mark">
                ph<span>.</span>
              </span>
              <span>
                phanhuynh<span className="pf-brand-period">.</span>
              </span>
            </Link>
            <p>
              {t(
                "Xây dựng với sự tò mò. Phát triển bằng trải nghiệm.",
                "Built with curiosity. Growing through experience.",
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
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin size={16} />
                LinkedIn
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
        <div className="pf-footer-bottom">
          <span>
            © {new Date().getFullYear()} {profile.name || "Phan Huỳnh Văn Đô"}
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
