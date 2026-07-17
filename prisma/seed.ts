import { PrismaClient } from "@prisma/client";
import {
  profile,
  projects,
  experiences,
  educations,
  certifications,
} from "../src/lib/cv/data";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database for both vi and en locales...");

  const locales = ["vi", "en"] as const;

  for (const locale of locales) {
    // 1. Profile
    await db.profile.upsert({
      where: { id: `profile-${locale}` },
      update: {},
      create: {
        id: `profile-${locale}`,
        locale,
        name: profile.name,
        role: profile.role,
        tagline: profile.tagline,
        location: profile.location,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        github: profile.github,
        linkedin: profile.linkedin,
        summary: profile.summary,
        avatar: profile.avatar,
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
            category: p.category,
            description: p.description,
            features: JSON.stringify(p.features),
            tech: JSON.stringify(p.tech),
            image: p.image,
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
