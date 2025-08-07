import { PrismaClient, Student } from "../src/generated/prisma";
import type { Prisma } from "../src/generated/prisma";

const client = new PrismaClient();

const getStudents = (): Prisma.StudentCreateInput[] => [
  { email: "Test@gmail.com", username: "name", password: "password" },
  { email: "Test2@gmail.com", username: "name2", password: "password2" },
];

const getAssignments = (
  students: Student[],
): Prisma.AssignmentCreateInput[] => [
  {
    student: { connect: { id: students[0].id } },
    text: "Read Chapter 1",
    title: "English Assignment",
    dueDate: new Date("2023-10-01T12:00:00Z"),
    teacher: "Mr. Smith",
    lesson: "Introduction to Literature",
  },
  {
    student: { connect: { id: students[1].id } },
    text: "Finish Exercise 3",
    title: "Math Assignment",
    dueDate: new Date("2023-10-02T12:00:00Z"),
    teacher: "Ms. Johnson",
    lesson: "Algebra Basics",
  },
];

const main = async () => {
  const users = await Promise.all(
    getStudents().map((student) => client.student.create({ data: student })),
  );

  await Promise.all(
    getAssignments(users).map((assignment) =>
      client.assignment.create({ data: assignment }),
    ),
  );
};

main()
  .then(() => {
    console.log("✅ Seeding complete");
  })
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(() => client.$disconnect());
