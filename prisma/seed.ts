import { PrismaClient } from "../src/generated/prisma";

const client = new PrismaClient();

async function createNotesForStudent(studentId: string) {
  const notesData = [
    {
      title: "Biology Revision",
      content: "Review chapters on cell structure and photosynthesis.",
      createdAt: BigInt(Date.now()),
    },
    {
      title: "History Notes",
      content: "Key points on World War II causes and consequences.",
      createdAt: BigInt(Date.now()),
    },
    {
      title: "Math Formulas",
      content: "List of essential algebra and geometry formulas.",
      createdAt: BigInt(Date.now()),
    },
  ];

  const createdNotes = await Promise.all(
    notesData.map((note) =>
      client.note.create({
        data: {
          ...note,
          student: {
            connect: { id: studentId },
          },
        },
      }),
    ),
  );

  console.log("Created notes:", createdNotes);
}

createNotesForStudent("6490c886-d273-43d6-9c42-8d519b1ed433")
  .catch((e) => {
    console.error("Error creating notes:", e);
  })
  .finally(async () => {
    await client.$disconnect();
  });
