import { PrismaClient } from "../src/generated/prisma";
import { nanoid } from "nanoid";

const client = new PrismaClient();

async function createFolderForStudent(studentId: string, folderTitle: string) {
  const folder = await client.folder.create({
    data: {
      title: folderTitle,
      student: {
        connect: { id: studentId },
      },
      notes: {
        create: [
          {
            id: nanoid(),
            title: "Sample Note 1",
            content: "This is the content of sample note 1.",
            createdAt: new Date(),
            studentId: studentId,
          },
          {
            id: nanoid(),
            title: "Sample Note 2",
            content: "This is the content of sample note 2.",
            createdAt: new Date(),
            studentId: studentId,
          },
        ],
      },
    },
  });
  console.log("Created folder:", folder);
  return folder;
}
//
// createNotesForStudent("6490c886-d273-43d6-9c42-8d519b1ed433")
//   .catch((e) => {
//     console.error("Error creating notes:", e);
//   })
//   .finally(async () => {
//     await client.$disconnect();
//   });

createFolderForStudent(
  "40a87edb-8ca8-4e3d-ac93-5857f8ef4939",
  "Study Materials",
)
  .catch((e) => {
    console.error("Error creating folder:", e);
  })
  .finally(async () => {
    await client.$disconnect();
  });
