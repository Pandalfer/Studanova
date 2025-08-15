import { PrismaClient } from "@/generated/prisma";

const client = new PrismaClient();

const main = async () => {
  const user = await client.student.findFirst({
    where: { username: "name2" },
    include: { assignments: true },
  });

  if (user) {
    await client.student.update({
      data: { username: "Updated Name" },
      where: { id: user.id },
    });
  }

  client.$disconnect();
};

main().catch((err) => {
  console.error(err);
  client.$disconnect(); // ensure disconnection even on error
});
