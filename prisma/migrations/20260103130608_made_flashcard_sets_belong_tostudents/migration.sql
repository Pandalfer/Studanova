/*
  Warnings:

  - You are about to drop the column `studentId` on the `Flashcard` table. All the data in the column will be lost.
  - Added the required column `studentId` to the `FlashcardSet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Flashcard" DROP CONSTRAINT "Flashcard_studentId_fkey";

-- AlterTable
ALTER TABLE "public"."Flashcard" DROP COLUMN "studentId";

-- AlterTable
ALTER TABLE "public"."FlashcardSet" ADD COLUMN     "studentId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."FlashcardSet" ADD CONSTRAINT "FlashcardSet_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
