/*
  Warnings:

  - Made the column `setId` on table `Flashcard` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Flashcard" DROP CONSTRAINT "Flashcard_setId_fkey";

-- AlterTable
ALTER TABLE "public"."Flashcard" ALTER COLUMN "setId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Flashcard" ADD CONSTRAINT "Flashcard_setId_fkey" FOREIGN KEY ("setId") REFERENCES "public"."FlashcardSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
