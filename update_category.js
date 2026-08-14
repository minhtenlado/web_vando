const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const post = await prisma.post.findFirst({
    where: { title: { contains: "Lượng tử hóa" } }
  })
  if (post) {
    await prisma.post.update({
      where: { id: post.id },
      data: { category: "IOT" }
    })
    console.log("Updated category to IOT for post:", post.title)
  } else {
    console.log("Post not found")
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
