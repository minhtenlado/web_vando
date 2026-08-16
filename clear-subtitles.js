const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.profile.updateMany({
    data: {
      aboutSubtitle: "",
      skillsSubtitle: "",
      experienceSubtitle: ""
    }
  })
  console.log("Cleared subtitles in DB")
}
main()
