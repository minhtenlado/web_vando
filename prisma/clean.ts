import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Cleaning database tables...");
  
  await db.post.deleteMany({});
  await db.project.deleteMany({});
  await db.experience.deleteMany({});
  await db.profile.deleteMany({});

  const locales = ["vi", "en"] as const;
  for (const locale of locales) {
    const isEn = locale === "en";
    await db.profile.create({
      data: {
        id: `profile-${locale}`,
        locale,
        name: "",
        role: "",
        tagline: "",
        location: "",
        email: "",
        phone: "",
        website: "",
        github: "",
        linkedin: "",
        summary: "",
        avatar: "",
        stats: "[]",
        skillGroups: "[]",
        educations: "[]",
        certifications: "[]",
        nowText: "",
        aboutSubtitle: "",
        skillsSubtitle: "",
        experienceSubtitle: "",
        animatedRoles: "[]",
        techBadges: "[]",
        languages: "[]",
      },
    });
  }

  console.log("Database successfully cleaned! Ready for fresh custom setup.");
}

main()
  .catch((e) => {
    console.error("Clean error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
