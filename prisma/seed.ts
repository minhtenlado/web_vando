import { PrismaClient } from "@prisma/client";
import {
  profile,
  projects,
  experiences,
  educations,
  certifications,
  stats,
  skillGroups,
  defaultPosts,
  defaultPostsEn,
} from "../src/lib/cv/data";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database for both vi and en locales...");

  const locales = ["vi", "en"] as const;

  for (const locale of locales) {
    const isEn = locale === "en";

    // 1. Profile
    await db.profile.upsert({
      where: { id: `profile-${locale}` },
      update: {
        locale,
        name: "Phan Huỳnh Văn Đô",
        role: isEn ? "Embedded Software, IoT & Edge AI Engineer" : "Kỹ sư Lập trình Nhúng, IoT & Edge AI",
        tagline: profile.tagline,
        location: profile.location,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        github: profile.github,
        linkedin: profile.linkedin,
        summary: profile.summary,
        avatar: "/uploads/avatar.jpg",
        stats: JSON.stringify(stats),
        skillGroups: JSON.stringify(skillGroups),
        educations: JSON.stringify(educations),
        certifications: JSON.stringify(certifications),
        nowText: "Nghiên cứu và phát triển các hệ thống nhúng, IoT & Edge AI.",
        aboutSubtitle: "Hành trình từ Kỹ thuật Điện tử đến Hệ thống Nhúng & Trí tuệ Nhân tạo",
        skillsSubtitle: "Lập trình Vi điều khiển, RTOS, IoT Protocols & Edge AI Inference",
        experienceSubtitle: "Kinh nghiệm làm việc thực tế trong các dự án Công nghiệp & Nghiên cứu",
        animatedRoles: JSON.stringify(["Kỹ sư Lập trình Nhúng", "IoT & Edge AI Engineer", "Robotics Developer", "RTOS Specialist"]),
        techBadges: JSON.stringify([
          { icon: "Cpu", text: "STM32 / ESP32" },
          { icon: "Layers", text: "FreeRTOS" },
          { icon: "Brain", text: "Edge AI" },
          { icon: "Radio", text: "MQTT / LoRaWAN" }
        ]),
        languages: JSON.stringify([
          { language: "Tiếng Việt", level: "Bản ngữ" },
          { language: "Tiếng Anh", level: "Đọc hiểu tài liệu chuyên ngành" }
        ]),
      },
      create: {
        id: `profile-${locale}`,
        locale,
        name: "Phan Huỳnh Văn Đô",
        role: isEn ? "Embedded Software, IoT & Edge AI Engineer" : "Kỹ sư Lập trình Nhúng, IoT & Edge AI",
        tagline: profile.tagline,
        location: profile.location,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        github: profile.github,
        linkedin: profile.linkedin,
        summary: profile.summary,
        avatar: "/uploads/avatar.jpg",
        stats: JSON.stringify(stats),
        skillGroups: JSON.stringify(skillGroups),
        educations: JSON.stringify(educations),
        certifications: JSON.stringify(certifications),
        nowText: "Nghiên cứu và phát triển các hệ thống nhúng, IoT & Edge AI.",
        aboutSubtitle: "Hành trình từ Kỹ thuật Điện tử đến Hệ thống Nhúng & Trí tuệ Nhân tạo",
        skillsSubtitle: "Lập trình Vi điều khiển, RTOS, IoT Protocols & Edge AI Inference",
        experienceSubtitle: "Kinh nghiệm làm việc thực tế trong các dự án Công nghiệp & Nghiên cứu",
        animatedRoles: JSON.stringify(["Kỹ sư Lập trình Nhúng", "IoT & Edge AI Engineer", "Robotics Developer", "RTOS Specialist"]),
        techBadges: JSON.stringify([
          { icon: "Cpu", text: "STM32 / ESP32" },
          { icon: "Layers", text: "FreeRTOS" },
          { icon: "Brain", text: "Edge AI" },
          { icon: "Radio", text: "MQTT / LoRaWAN" }
        ]),
        languages: JSON.stringify([
          { language: "Tiếng Việt", level: "Bản ngữ" },
          { language: "Tiếng Anh", level: "Đọc hiểu tài liệu chuyên ngành" }
        ]),
      },
    });

    // 2. Projects
    const existingProjects = await db.project.count({ where: { locale } });
    if (existingProjects === 0) {
      for (let i = 0; i < projects.length; i++) {
        const p = projects[i];
        await db.project.create({
          data: {
            locale,
            title: p.title,
            subtitle: p.subtitle || "",
            overviewQuote: p.overviewQuote || "",
            year: p.year || "",
            role: p.role || "",
            highlight: p.highlight || "",
            projectType: p.projectType || "",
            responsibilities: JSON.stringify(p.responsibilities || []),
            results: JSON.stringify(p.results || []),
            category: p.category,
            description: p.description,
            features: JSON.stringify(p.features || []),
            tech: JSON.stringify(p.tech || []),
            image: p.image || "",
            images: JSON.stringify(p.images || []),
            youtubeUrl: p.youtubeUrl,
            link: p.link,
            repo: p.repo,
            order: i,
          },
        });
      }
    }

    // 3. Experiences
    const existingExperiences = await db.experience.count({ where: { locale } });
    if (existingExperiences === 0) {
      for (let i = 0; i < experiences.length; i++) {
        const e = experiences[i];
        await db.experience.create({
          data: {
            locale,
            role: e.role,
            company: e.company,
            companyUrl: e.companyUrl,
            period: e.period,
            location: e.location,
            description: e.description,
            highlights: JSON.stringify(e.highlights),
            stack: JSON.stringify(e.stack),
            order: i,
          },
        });
      }
    }

    // 4. Posts (Seed when count === 0 for locale or overall db.post.count() === 0)
    const existingPosts = await db.post.count({ where: { locale } });
    if (existingPosts === 0) {
      const postsToSeed = isEn ? defaultPostsEn : defaultPosts;
      for (const p of postsToSeed) {
        await db.post.create({
          data: {
            locale,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            content: p.content,
            published: true,
            category: p.category,
            coverImage: p.coverImage || "/uploads/avatar.jpg",
            pdfUrl: p.pdfUrl || null,
            seoTitle: p.seoTitle || p.title,
            seoDescription: p.seoDescription || p.excerpt,
            seoKeywords: p.seoKeywords || "",
          },
        });
      }
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

