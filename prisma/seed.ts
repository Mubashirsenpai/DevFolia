import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.profile.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      displayName: "Your Name",
      headline: "Your headline — edit in Admin",
      bio: "Use the admin panel to add your bio, projects, skills, awards, and leadership experience.",
    },
    update: {},
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
