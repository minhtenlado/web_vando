"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Cpu,
  ExternalLink,
  Image as ImageIcon,
  Search,
  X,
} from "lucide-react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { useSiteData } from "./site-data-context";
import { useLocale } from "./locale-context";
import { plainText, externalUrl } from "@/lib/cv/presentation";
import type { SiteProject } from "@/lib/cv/site-data-server";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/đ/g, "d")
    .trim();
}

function safeActionHref(value: unknown, fallback: string) {
  const raw = String(value ?? "").trim();
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  if (raw.startsWith("#")) return raw;
  return externalUrl(raw) || fallback;
}

function supportedImage(src?: string | null) {
  if (!src) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      (url.hostname === "res.cloudinary.com" ||
        url.hostname.endsWith(".public.blob.vercel-storage.com"))
    );
  } catch {
    return false;
  }
}

function ProjectStatus({ status, locale }: { status?: string; locale: "vi" | "en" }) {
  if (!status) return null;
  const labels: Record<string, { vi: string; en: string }> = {
    completed: { vi: "Hoàn thành", en: "Completed" },
    "in-development": { vi: "Đang phát triển", en: "In development" },
    prototype: { vi: "Nguyên mẫu", en: "Prototype" },
    research: { vi: "Nghiên cứu", en: "Research" },
  };
  const label = labels[status];
  if (!label) return null;
  return <span className="lab-status">{label[locale]}</span>;
}

function ProjectImage({
  src,
  alt,
  sizes,
  fallbackClassName = "",
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  fallbackClassName?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`lab-image-fallback ${fallbackClassName}`} role="img" aria-label={`${alt}: image unavailable`}>
        <Cpu aria-hidden="true" />
        <span>{alt}</span>
      </div>
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} onError={() => setFailed(true)} />;
}

function formatDate(value: string, locale: "vi" | "en") {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { dateStyle: "medium" }).format(date);
}

function SectionHeading({
  index,
  label,
  title,
  description,
}: {
  index: string;
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="lab-section-heading">
      <p className="lab-eyebrow"><span>{index}</span>{label}</p>
      <div className="lab-section-title-row">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: SiteProject }) {
  const { locale } = useLocale();
  const image = supportedImage(project.image) ? project.image : undefined;
  return (
    <article className="lab-project-card">
      <Link href={`/projects/${project.id}`} className="lab-project-link">
        <div className="lab-project-image">
          {image ? (
            <ProjectImage key={image} src={image} alt={project.title} sizes="(max-width: 680px) 100vw, (max-width: 1080px) 50vw, 33vw" />
          ) : (
            <div className="lab-image-fallback" aria-label={`${project.title}: no project image`}>
              <Cpu aria-hidden="true" />
              <span>{project.title}</span>
            </div>
          )}
          <span className="lab-project-open" aria-hidden="true"><ArrowUpRight size={18} /></span>
        </div>
        <div className="lab-project-content">
          <div className="lab-project-meta">
            <span>{project.category || "Engineering project"}</span>
            <ProjectStatus status={project.status} locale={locale} />
          </div>
          <h3>{project.title}</h3>
          <p>{plainText(project.subtitle || project.description) || ""}</p>
          {project.tech?.length > 0 && (
            <ul className="lab-tech-list" aria-label="Technologies">
              {project.tech.slice(0, 4).map((tech) => <li key={tech}>{tech}</li>)}
              {project.tech.length > 4 && <li>+{project.tech.length - 4}</li>}
            </ul>
          )}
        </div>
      </Link>
    </article>
  );
}

function MediaCard({ project, src }: { project: SiteProject; src: string }) {
  return (
    <Link href={`/projects/${project.id}`} className="lab-media-card">
      <div className="lab-media-image">
        <ProjectImage key={src} src={src} alt={`${project.title} project media`} sizes="(max-width: 680px) 90vw, (max-width: 1080px) 45vw, 30vw" />
      </div>
      <span><ImageIcon size={14} />{project.title}<ArrowUpRight size={14} /></span>
    </Link>
  );
}

export function PortfolioHome() {
  const { profile, projects, posts, settings, loading } = useSiteData();
  const { t, locale } = useLocale();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const publishedProjects = useMemo(() => projects.filter((project) => project.published !== false), [projects]);
  const selectedFeaturedProjects = useMemo(() => publishedProjects.filter((project) => project.featured).slice(0, 3), [publishedProjects]);
  const usingDefaultFeatured = selectedFeaturedProjects.length === 0;
  // Legacy records have no featured flag. Preserve the existing public order
  // and use real published projects until Admin supplies explicit selections.
  const featuredProjects = usingDefaultFeatured ? publishedProjects.slice(0, 3) : selectedFeaturedProjects;
  const heroProject = featuredProjects[0] ?? publishedProjects[0];
  const heroImage = supportedImage(heroProject?.image) ? heroProject.image : undefined;
  const github = externalUrl(profile.github);
  const primaryUrl = safeActionHref(settings.heroPrimaryUrl, "#projects");
  const secondaryUrl = safeActionHref(settings.heroSecondaryUrl, github || "");
  const heroTitle = locale === "vi"
    ? String(settings.heroHeadlineVi || "Dự án kỹ thuật. Sản phẩm thực tế.")
    : String(settings.heroHeadlineEn || "Engineering projects. Built systems.");
  const heroDescription = locale === "vi"
    ? String(settings.heroDescriptionVi || settings.portfolioTagline || "")
    : String(settings.heroDescriptionEn || settings.portfolioTagline || "");
  const categories = useMemo(() => Array.from(new Set(publishedProjects.map((project) => project.category?.trim()).filter((value): value is string => Boolean(value)))), [publishedProjects]);
  const normalizedQuery = normalizeSearch(query);
  const filteredProjects = useMemo(() => publishedProjects.filter((project) => {
    const matchesCategory = category === "all" || project.category === category;
    const searchable = normalizeSearch([
      project.title,
      project.category,
      project.subtitle,
      project.description,
      project.highlight,
      ...(project.tech ?? []),
    ].map(plainText).join(" "));
    return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
  }), [publishedProjects, category, normalizedQuery]);
  const publishedPosts = useMemo(() => posts
    .filter((post) => post.published)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 3), [posts]);
  const media = useMemo(() => publishedProjects.flatMap((project) => {
    const images = [project.image, ...(project.images ?? [])].filter((value, index, all): value is string => Boolean(value) && all.indexOf(value) === index && supportedImage(value));
    return images.slice(0, 2).map((src) => ({ project, src }));
  }).slice(0, 6), [publishedProjects]);

  return (
    <div className="lab-site" id="top">
      <Navbar />
      <main id="main-content">
        <section className="lab-hero lab-container" aria-labelledby="lab-title">
          <div className="lab-hero-copy">
            <p className="lab-eyebrow"><span>01</span> EMBEDDED SYSTEMS / EDGE AI / ROBOTICS</p>
            <h1 id="lab-title">{heroTitle}</h1>
            <p className="lab-hero-description">{heroDescription}</p>
            <div className="lab-hero-actions">
              {settings.sectionProjectsEnabled !== false && <a className="lab-button lab-button-primary" href={primaryUrl}>
                {(locale === "vi" ? settings.heroPrimaryLabelVi : settings.heroPrimaryLabelEn) || t("Khám phá dự án", "Explore projects")}<ArrowRight size={17} />
              </a>}
              {secondaryUrl && <a className="lab-button lab-button-secondary" href={secondaryUrl} target={secondaryUrl.startsWith("http") ? "_blank" : undefined} rel={secondaryUrl.startsWith("http") ? "noopener noreferrer" : undefined}>
                {(locale === "vi" ? settings.heroSecondaryLabelVi : settings.heroSecondaryLabelEn) || "GitHub"}<ExternalLink size={14} />
              </a>}
            </div>
            <div className="lab-hero-facts" aria-label="Project areas">
              <span>01 / HARDWARE</span><span>02 / FIRMWARE</span><span>03 / INTELLIGENCE</span>
            </div>
          </div>
          <div className="lab-hero-visual">
            <div className="lab-visual-frame">
              {heroProject && heroImage ? (
                <ProjectImage key={heroImage} src={heroImage} alt={heroProject.title} priority sizes="(max-width: 800px) 100vw, 52vw" fallbackClassName="lab-hero-fallback" />
              ) : heroProject ? (
                <div className="lab-image-fallback lab-hero-fallback"><Cpu aria-hidden="true" /><span>{heroProject.title}</span></div>
              ) : (
                <div className="lab-image-fallback lab-hero-fallback"><Cpu aria-hidden="true" /><span>Engineering systems</span></div>
              )}
              <span className="lab-frame-label">{heroProject?.category || "ENGINEERING / SYSTEMS"}</span>
            </div>
            {heroProject && (
              <Link className="lab-visual-caption" href={`/projects/${heroProject.id}`}>
                <span><small>PROJECT / {String(publishedProjects.findIndex((item) => item.id === heroProject.id) + 1).padStart(2, "0")}</small><strong>{heroProject.title}</strong></span>
                <ArrowUpRight size={20} />
              </Link>
            )}
            <span className="lab-coordinate" aria-hidden="true">PHANHUYNH.ID.VN / LAB-01</span>
          </div>
        </section>

        {settings.sectionFeaturedEnabled !== false && featuredProjects.length > 0 && (
          <section className="lab-section lab-container" aria-labelledby="featured-title">
            <SectionHeading
              index="02"
              label="CURATED BUILDS"
              title={t("Dự án nổi bật", "Featured projects")}
              description={usingDefaultFeatured
                ? t("Các dự án đã xuất bản, theo thứ tự hiện có.", "Published projects in their existing order.")
                : t("Các dự án được chọn từ hệ thống quản trị nội dung.", "Projects selected from the content manager.")}
            />
            <div className="lab-project-grid lab-featured-grid" id="featured">
              {featuredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          </section>
        )}

        {settings.sectionProjectsEnabled !== false && <section className="lab-section lab-container" id="projects" aria-labelledby="projects-title">
          <SectionHeading index="03" label="PROJECT INDEX" title={t("Thư viện dự án", "Project explorer")} description={t("Tìm theo lĩnh vực, nền tảng hoặc công nghệ.", "Search by discipline, platform, or technology.")} />
          <div className="lab-project-toolbar">
            <div className="lab-filter-list" role="group" aria-label={t("Lọc lĩnh vực dự án", "Filter project categories")}>
              <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}>{t("Tất cả", "All projects")}<span>{publishedProjects.length}</span></button>
              {categories.map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
            </div>
            <label className="lab-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">{t("Tìm dự án", "Search projects")}</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Tên, công nghệ…", "Project or technology…")} />
              {query && <button type="button" onClick={() => setQuery("")} aria-label={t("Xóa tìm kiếm", "Clear search")}><X size={15} /></button>}
            </label>
          </div>
          {loading && publishedProjects.length === 0 ? (
            <div className="lab-project-grid" aria-label={t("Đang tải dự án", "Loading projects")} aria-busy="true">
              {Array.from({ length: 3 }, (_, index) => <div className="lab-project-skeleton" key={index} />)}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="lab-project-grid" aria-busy={loading}>
              {filteredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          ) : (
            <div className="lab-empty" role="status">
              <Search size={24} /><h3>{t("Không tìm thấy dự án", "No projects found")}</h3>
              <p>{t("Thử từ khóa hoặc danh mục khác.", "Try another search or category.")}</p>
              {(query || category !== "all") && <button type="button" onClick={() => { setQuery(""); setCategory("all"); }}>{t("Xóa bộ lọc", "Clear filters")}<ArrowRight size={15} /></button>}
            </div>
          )}
          <p className="lab-results" role="status">{filteredProjects.length} / {publishedProjects.length} {t("dự án", "projects")}</p>
        </section>}

        {settings.sectionMediaEnabled !== false && media.length > 0 && (
          <section className="lab-section lab-media-section" aria-labelledby="media-title">
            <div className="lab-container">
              <SectionHeading index="04" label="HARDWARE / SOFTWARE" title={t("Trong phòng thí nghiệm", "From the lab")} description={t("Hình ảnh được liên kết trực tiếp với các dự án.", "Project media linked to its source project.")} />
              <div className="lab-media-grid">{media.map(({ project, src }) => <MediaCard key={`${project.id}:${src}`} project={project} src={src} />)}</div>
            </div>
          </section>
        )}

        {publishedPosts.length > 0 && settings.navBlogEnabled !== false && settings.sectionNotesEnabled !== false && (
          <section className="lab-section lab-container" id="notes" aria-labelledby="notes-title">
            <SectionHeading index="05" label="ENGINEERING NOTES" title={t("Ghi chú kỹ thuật", "Engineering notes")} description={t("Bài viết và hướng dẫn kỹ thuật đã xuất bản.", "Published technical articles and guides.")} />
            <div className="lab-notes-list">
              {publishedPosts.map((post, index) => (
                <Link className="lab-note" href={`/posts/${post.slug}`} key={post.id}>
                  <span className="lab-note-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="lab-note-copy"><small>{post.category || t("GHI CHÚ KỸ THUẬT", "ENGINEERING NOTE")}{formatDate(post.createdAt, locale) && <>{" · "}{formatDate(post.createdAt, locale)}</>}</small><strong>{post.title}</strong><span>{plainText(post.excerpt)}</span></span>
                  <ArrowUpRight size={19} />
                </Link>
              ))}
            </div>
            <Link href="/notes" className="lab-all-notes">{t("Xem tất cả ghi chú", "View all notes")}<ArrowRight size={16} /></Link>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
