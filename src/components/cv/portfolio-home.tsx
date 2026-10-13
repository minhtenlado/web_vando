"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  Cpu,
  Radio,
  BrainCircuit,
  MapPin,
  Search,
  GraduationCap,
  Plus,
  Layers3,
  X,
} from "lucide-react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { useSiteData } from "./site-data-context";
import { useLocale } from "./locale-context";
import { HashScrollHandler } from "./hash-scroll-handler";
import { CvSettingsApplier } from "./cv-settings-applier";
import { ScrollProgress } from "./scroll-progress";
import { localizedText, plainText, externalUrl } from "@/lib/cv/presentation";
import type { SiteProject } from "@/lib/cv/site-data-server";

const CommandPalette = dynamic(() =>
  import("./command-palette").then((m) => m.CommandPalette),
);
const ContactModal = dynamic(() =>
  import("./studio-contact-modal").then((m) => m.StudioContactModal),
);
const AiChat = dynamic(() =>
  import("./global-ai-chatbot").then((m) => m.GlobalAiChatbot),
);

function SectionHeading({
  number,
  label,
  title,
  children,
}: {
  number: string;
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="pf-section-heading">
      <div>
        <p className="pf-eyebrow">
          <span>{number}</span> {label}
        </p>
        <h2>{title}</h2>
      </div>
      {children && <div className="pf-section-aside">{children}</div>}
    </div>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: SiteProject;
  index: number;
}) {
  const { t } = useLocale();
  const [failed, setFailed] = useState(false);
  return (
    <Link href={`/projects/${project.id}`} className="pf-project">
      <div className={`pf-project-image pf-project-tone-${index % 3}`}>
        {project.image && !failed ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 650px) 94vw, (max-width: 1000px) 47vw, 600px"
            className="pf-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="pf-project-placeholder" aria-hidden="true">
            <Cpu size={72} strokeWidth={1} />
            <span>{project.category || "Embedded systems"}</span>
          </div>
        )}
        <span className="pf-project-index">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="pf-project-open" aria-hidden="true">
          <ArrowUpRight size={22} />
        </span>
      </div>
      <div className="pf-project-meta">
        <span>
          {project.category || t("Dự án kỹ thuật", "Engineering project")}
        </span>
        <span>{project.year}</span>
      </div>
      <h3>{project.title}</h3>
      <p className="pf-project-description">
        {plainText(project.subtitle || project.description)}
      </p>
      <div className="pf-tags">
        {project.tech?.slice(0, 3).map((tech) => (
          <span key={tech}>{tech}</span>
        ))}
        {project.tech?.length > 3 && <span>+{project.tech.length - 3}</span>}
      </div>
    </Link>
  );
}

export function PortfolioHome() {
  const { profile, projects, posts, experiences, settings, loading } =
    useSiteData();
  const { t, locale } = useLocale();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [avatarFailed, setAvatarFailed] = useState(false);
  const github = externalUrl(profile.github);
  const publishedPosts = posts.filter((post) => post.published);
  const filters = [
    { id: "all", label: t("Tất cả", "All work") },
    { id: "robotics", label: "Robotics" },
    { id: "iot", label: "IoT & Embedded" },
    { id: "ai", label: "AI & Vision" },
  ];
  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const text =
          `${project.title} ${project.category} ${project.tech?.join(" ") || ""}`.toLowerCase();
        const matches =
          filter === "all" ||
          (filter === "robotics" && /robot|gazebo|ros 2/.test(text)) ||
          (filter === "iot" && /iot|embedded|esp32|stm32/.test(text)) ||
          (filter === "ai" &&
            /\bai\b|aiot|vision|neural|pytorch|opencv|genetic/.test(text));
        return matches && text.includes(query.trim().toLowerCase());
      }),
    [projects, filter, query],
  );
  const openContact = () =>
    window.dispatchEvent(new CustomEvent("open-contact-modal"));
  const skills = profile.skillGroups || [];
  const availabilityText =
    settings.availabilityText &&
    settings.availabilityText !== "Sẵn sàng cho cơ hội mới"
      ? plainText(settings.availabilityText)
      : t("Sẵn sàng cho cơ hội mới", "Open to new opportunities");

  return (
    <div className="pf-site" id="top">
      <HashScrollHandler />
      <CvSettingsApplier />
      <ScrollProgress />
      <CommandPalette />
      <ContactModal />
      {settings.showAiButton !== false && <AiChat />}
      <Navbar />
      <main id="main-content">
        <section className="pf-hero pf-container" aria-labelledby="hero-title">
          <div className="pf-hero-copy">
            <div className="pf-status">
              <span
                className={
                  profile.available ? "pf-status-dot" : "pf-status-dot pf-busy"
                }
              />
              {profile.available
                ? availabilityText
                : t(
                    "Đang tập trung vào dự án",
                    "Currently focused on projects",
                  )}
            </div>
            <p className="pf-intro">
              {t("Xin chào, mình là", "Hello, I’m")}{" "}
              <strong>{profile.name || "Phan Huỳnh Văn Đô"}</strong>
              <span className="pf-small-star" aria-hidden="true">
                ✳
              </span>
            </p>
            <h1 id="hero-title">
              {t("Khi phần cứng", "Where hardware")}
              <br />
              {t("gặp", "meets")} <em>{t("trí tuệ.", "intelligence.")}</em>
            </h1>
            <p className="pf-hero-description">
              {profile.tagline ||
                t(
                  "Mình kết nối phần cứng, phần mềm và AI để xây dựng những hệ thống nhúng hữu ích trong thế giới thực.",
                  "I connect hardware, software, and AI to build embedded systems that make a difference in the real world.",
                )}
            </p>
            <div className="pf-hero-actions">
              {settings.navProjectsEnabled !== false && (
                <a className="pf-button pf-button-dark" href="#projects">
                  {t("Khám phá dự án", "Explore my work")}
                  <ArrowUpRight size={19} />
                </a>
              )}
              {settings.navContactEnabled !== false && (
                <button className="pf-text-button" onClick={openContact}>
                  {t("Cùng trò chuyện", "Let’s talk")}
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
            <div className="pf-hero-footnote">
              <span>
                {settings.showLocation !== false && (
                  <>
                    <MapPin size={14} />
                    {profile.location ||
                      t(
                        "TP. Hồ Chí Minh, Việt Nam",
                        "Ho Chi Minh City, Vietnam",
                      )}
                  </>
                )}
              </span>
              <a
                href={
                  settings.navProjectsEnabled !== false
                    ? "#projects"
                    : settings.navAboutEnabled !== false
                      ? "#about"
                      : "#contact"
                }
              >
                <ArrowDown size={16} />
                {t("Cuộn để khám phá", "Scroll to explore")}
              </a>
            </div>
          </div>
          <div className="pf-hero-art">
            <div className="pf-photo-backdrop" aria-hidden="true" />
            <div className="pf-portrait">
              <Image
                src={
                  avatarFailed ? "/avatar.png" : profile.avatar || "/avatar.png"
                }
                alt={profile.name || "Phan Huỳnh Văn Đô"}
                fill
                preload
                sizes="(max-width: 800px) 85vw, 480px"
                className="pf-cover"
                onError={() => setAvatarFailed(true)}
              />
              <div className="pf-portrait-caption">
                <span>
                  {t(
                    "TƯ DUY HỆ THỐNG. TẠO RA GIẢI PHÁP.",
                    "SYSTEMS THINKER. HANDS-ON BUILDER.",
                  )}
                </span>
                <ArrowUpRight size={18} />
              </div>
            </div>
            <div className="pf-engineer-stamp" aria-hidden="true">
              <Cpu size={28} strokeWidth={1.4} />
              <span>BUILD · LEARN · REPEAT</span>
            </div>
            <div className="pf-system-card">
              <div className="pf-system-icon">
                <Layers3 size={25} />
              </div>
              <div>
                <span>{t("Kết nối những ý tưởng", "Connecting the dots")}</span>
                <strong>
                  Hardware <span>×</span> Software <span>×</span> AI
                </strong>
              </div>
              <span className="pf-card-dot" />
            </div>
            {settings.showLocation !== false && (
              <span className="pf-art-coordinate" aria-hidden="true">
                HO CHI MINH CITY, VIETNAM
              </span>
            )}
          </div>
        </section>
        <div className="pf-stack-strip">
          <div className="pf-container">
            <span className="pf-stack-label">
              {t(
                "TỪ Ý TƯỞNG ĐẾN HỆ THỐNG",
                "FROM CONCEPT TO CONNECTED SYSTEMS",
              )}
            </span>
            <div className="pf-stack-list">
              {(profile.techBadges?.length
                ? profile.techBadges.slice(0, 7).map((b) => b.text)
                : [
                    "C / C++",
                    "Python",
                    "Embedded Linux",
                    "STM32",
                    "ESP32",
                    "Raspberry Pi",
                    "MQTT",
                  ]
              ).map((text) => (
                <span key={text}>{text}</span>
              ))}
            </div>
          </div>
        </div>

        {settings.navProjectsEnabled !== false && (
          <section className="pf-section pf-container" id="projects">
            <SectionHeading
              number="01"
              label={t("DỰ ÁN TIÊU BIỂU", "SELECTED WORK")}
              title={t("Ý tưởng thành hiện thực.", "Ideas made tangible.")}
            >
              <p>
                {t(
                  "Một vài hệ thống mình đã xây dựng — từ firmware đến những giải pháp AIoT hoàn chỉnh.",
                  "A selection of systems I’ve built — from low-level firmware to connected AIoT experiences.",
                )}
              </p>
              {github && (
                <a
                  className="pf-inline-link"
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                  <ArrowUpRight size={17} />
                </a>
              )}
            </SectionHeading>
            <div className="pf-project-toolbar">
              <div
                className="pf-filters"
                role="group"
                aria-label={t("Lọc dự án", "Filter projects")}
              >
                {filters.map((item) => (
                  <button
                    key={item.id}
                    aria-pressed={filter === item.id}
                    onClick={() => setFilter(item.id)}
                  >
                    {item.label}
                    {item.id === "all" && <span>{projects.length}</span>}
                  </button>
                ))}
              </div>
              <label className="pf-search">
                <Search size={16} />
                <span className="sr-only">
                  {t("Tìm dự án", "Search projects")}
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("Tìm dự án…", "Search projects…")}
                />
                {query && (
                  <button
                    aria-label={t("Xóa tìm kiếm", "Clear search")}
                    onClick={() => setQuery("")}
                  >
                    <X size={15} />
                  </button>
                )}
              </label>
            </div>
            <div className="pf-project-grid" aria-busy={loading}>
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id || project.title}
                  project={project}
                  index={index}
                />
              ))}
            </div>
            {filteredProjects.length === 0 && (
              <div className="pf-empty" role="status">
                <Search size={30} />
                <h3>{t("Chưa tìm thấy dự án", "No projects found")}</h3>
                <p>
                  {t(
                    "Hãy thử từ khóa hoặc nhóm dự án khác.",
                    "Try a different keyword or project category.",
                  )}
                </p>
                {(query || filter !== "all") && (
                  <button
                    className="pf-text-button"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                  >
                    {t("Xóa bộ lọc", "Reset filters")}
                    <ArrowRight size={17} />
                  </button>
                )}
              </div>
            )}
            <p className="pf-results-count" role="status">
              {filteredProjects.length} / {projects.length}{" "}
              {t("dự án", "projects")}
            </p>
          </section>
        )}

        {settings.navAboutEnabled !== false && (
          <section className="pf-about-band" id="about">
            <div className="pf-container pf-about-grid">
              <div>
                <p className="pf-eyebrow">
                  <span>02</span>
                  {t("VỀ MÌNH", "A LITTLE ABOUT ME")}
                </p>
                <h2>
                  {t("Tò mò là", "Curiosity is")}
                  <br />
                  <em>{t("điểm bắt đầu.", "the starting point.")}</em>
                </h2>
                <span className="pf-about-asterisk" aria-hidden="true">
                  ✳
                </span>
              </div>
              <div className="pf-about-copy">
                <p className="pf-about-summary">
                  {plainText(profile.summary) ||
                    t(
                      "Mình là kỹ sư IoT & Trí tuệ nhân tạo ứng dụng, tập trung vào Embedded Linux, Firmware và Edge AI. Mình thích biến những ý tưởng phức tạp thành các hệ thống hữu ích, ổn định và dễ sử dụng.",
                      "I’m an IoT and Applied AI engineer focused on Embedded Linux, firmware, and Edge AI. I enjoy turning complex ideas into useful, reliable systems.",
                    )}
                </p>
                {profile.principles?.length > 0 && (
                  <div className="pf-principles">
                    {profile.principles.map((principle, i) => (
                      <div key={i}>
                        <span>0{i + 1}</span>
                        <div>
                          <h3>{localizedText(principle.title, locale)}</h3>
                          <p>
                            {plainText(
                              localizedText(
                                principle.desc || principle.description,
                                locale,
                              ),
                            )}
                          </p>
                        </div>
                        <Plus size={16} aria-hidden="true" />
                      </div>
                    ))}
                  </div>
                )}
                {profile.nowText && (
                  <div className="pf-now">
                    <span className="pf-status-dot" />
                    <div>
                      <h3>{t("HIỆN TẠI", "RIGHT NOW")}</h3>
                      <p>{plainText(profile.nowText)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {settings.navSkillsEnabled !== false && skills.length > 0 && (
          <section className="pf-section pf-container" id="skills">
            <SectionHeading
              number="03"
              label={t("KỸ NĂNG & CÔNG NGHỆ", "TOOLS OF THE TRADE")}
              title={t(
                "Một hệ thống. Nhiều góc nhìn.",
                "One system. Many perspectives.",
              )}
            >
              <p>
                {t(
                  "Kết nối tư duy phần cứng, kỹ thuật phần mềm và trí tuệ nhân tạo.",
                  "Bringing hardware thinking, software engineering, and artificial intelligence together.",
                )}
              </p>
            </SectionHeading>
            <div className="pf-skills-grid">
              {skills.map((group, i) => {
                const Icon = [Cpu, Radio, BrainCircuit][i % 3];
                return (
                  <article
                    className={`pf-skill-group pf-skill-${i % 3}`}
                    key={i}
                  >
                    <Icon size={32} strokeWidth={1.4} />
                    <span className="pf-skill-number">0{i + 1}</span>
                    <h3>{localizedText(group.title, locale)}</h3>
                    <div className="pf-skill-list">
                      {(group.skills || []).map(
                        (skill: { name: unknown }, j: number) => (
                          <span key={j}>
                            {localizedText(skill.name, locale)}
                          </span>
                        ),
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {(profile.educations?.length > 0 ||
          (settings.navExperienceEnabled !== false &&
            experiences.length > 0)) && (
          <section className="pf-path-section pf-container" id="experience">
            <SectionHeading
              number="04"
              label={t("HÀNH TRÌNH", "THE JOURNEY")}
              title={t(
                "Luôn học hỏi. Luôn tiến lên.",
                "Always learning. Always building.",
              )}
            />
            <div className="pf-journey-grid">
              {settings.navExperienceEnabled !== false &&
                experiences.map((experience, i) => (
                  <article className="pf-journey-item" key={experience.id || i}>
                    <span className="pf-journey-icon">
                      <Cpu size={20} />
                    </span>
                    <p className="pf-eyebrow">{experience.period}</p>
                    <h3>{experience.role}</h3>
                    <p className="pf-journey-place">{experience.company}</p>
                    <p>{plainText(experience.description)}</p>
                    <div className="pf-tags">
                      {experience.stack?.slice(0, 4).map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  </article>
                ))}
              {profile.educations?.map((education, i) => (
                <article
                  className="pf-journey-item"
                  key={i}
                  id={i === 0 ? "education" : undefined}
                >
                  <span className="pf-journey-icon">
                    <GraduationCap size={22} />
                  </span>
                  <p className="pf-eyebrow">{education.period}</p>
                  <h3>{localizedText(education.degree, locale)}</h3>
                  <p className="pf-journey-place">
                    {localizedText(education.school, locale)}
                  </p>
                  <p>{plainText(localizedText(education.detail, locale))}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {settings.navBlogEnabled !== false && publishedPosts.length > 0 && (
          <section className="pf-section pf-container pf-notes" id="posts">
            <SectionHeading
              number="05"
              label={t("GHI CHÉP KỸ THUẬT", "FIELD NOTES")}
              title={t(
                "Học được gì, chia sẻ đó.",
                "Learn it. Build it. Share it.",
              )}
            >
              <p>
                {t(
                  "Những ghi chép từ quá trình thử nghiệm, xây dựng và tìm hiểu công nghệ.",
                  "Notes from experimenting, building, and figuring things out along the way.",
                )}
              </p>
            </SectionHeading>
            <div className="pf-post-list">
              {publishedPosts.map((post, i) => (
                <Link
                  key={post.id || post.slug}
                  href={`/posts/${post.slug}`}
                  className="pf-post"
                >
                  <span className="pf-post-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="pf-post-meta">
                      <span>{post.category || "Engineering"}</span>
                      <time dateTime={post.createdAt}>
                        {new Intl.DateTimeFormat(
                          locale === "en" ? "en-GB" : "vi-VN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            timeZone: "Asia/Ho_Chi_Minh",
                          },
                        ).format(new Date(post.createdAt))}
                      </time>
                    </p>
                    <h3>{post.title}</h3>
                    <p className="pf-post-excerpt">{plainText(post.excerpt)}</p>
                  </div>
                  <span className="pf-post-arrow" aria-hidden="true">
                    <ArrowUpRight size={24} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {settings.navContactEnabled !== false && (
          <section className="pf-contact-section pf-container" id="contact">
            <div className="pf-contact-card">
              <div>
                <p className="pf-eyebrow">
                  <span className="pf-status-dot" />
                  {t(
                    "CÙNG TẠO RA ĐIỀU HỮU ÍCH",
                    "LET’S BUILD SOMETHING USEFUL",
                  )}
                </p>
                <h2>
                  {t("Có một ý tưởng?", "Have an idea?")}
                  <br />
                  <em>{t("Cùng kết nối.", "Let’s connect.")}</em>
                </h2>
                <p>
                  {t(
                    "Một dự án, một cơ hội hợp tác, hay chỉ là một cuộc trò chuyện về công nghệ — mình luôn sẵn sàng lắng nghe.",
                    "A project, a collaboration, or just a good conversation about technology — I’d love to hear from you.",
                  )}
                </p>
                <button
                  className="pf-button pf-button-lime"
                  onClick={openContact}
                >
                  {t("Gửi lời chào", "Say hello")}
                  <ArrowUpRight size={20} />
                </button>
              </div>
              <div className="pf-contact-orbit" aria-hidden="true">
                <div />
                <div />
                <span>✳</span>
              </div>
              <span className="pf-contact-corner" aria-hidden="true">
                HARDWARE / SOFTWARE / HUMAN CONNECTION
              </span>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
