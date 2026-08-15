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
        name: "Phan Huỳnh Văn Đô",
        role: isEn ? "Software Engineer" : "Kỹ sư Phần mềm",
        tagline: "",
        location: "TP. Hồ Chí Minh, Việt Nam",
        email: "phanhuynhvando@gmail.com",
        phone: "+84 352820680",
        website: "phanhuynh.id.vn",
        github: "github.com/minhtenlado",
        linkedin: "linkedin.com/in/v%C4%83n-%C4%91%C3%B4/",
        summary: "",
        avatar: "/uploads/avatar.jpg",
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
