import { PrismaClient } from "../src/generated/prisma";
import {nanoid} from "nanoid";

const client = new PrismaClient();

async function createNotesForStudent(studentId: string) {
  const notesData = [
    {
      title: "Biology Revision",
      content: "Review chapters on cell structure and photosynthesis.",
      createdAt: new Date(),
    },
    {
      title: "History Notes",
      content: "Key points on World War II causes and consequences.",
      createdAt: new Date(),
    },
    {
      title: "Math Formulas",
      content: "List of essential algebra and geometry formulas.",
      createdAt: new Date(),
    },
  ];

  const createdNotes = await Promise.all(
    notesData.map((note) =>
      client.note.create({
        data: {
          ...note,
          id: nanoid(),
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
