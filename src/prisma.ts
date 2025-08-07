import { PrismaClient } from "@/generated/prisma";

const client = new PrismaClient();

const main = async () => {
  const user = await client.student.findFirst({
    where: { username: "name2" },
    include: { assignments: true },
  });

  console.log(user);

  if (user) {
    const newUser = await client.student.update({
      data: { username: "Updated Name" },
      where: { id: user?.id },
    });

    console.log("Updated User:", newUser);
  }

  client.$disconnect();
};

main();
