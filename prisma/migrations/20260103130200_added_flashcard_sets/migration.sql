-- AlterTable
ALTER TABLE "public"."Flashcard" ADD COLUMN     "setId" UUID;

-- CreateTable
CREATE TABLE "public"."FlashcardSet" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "FlashcardSet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Flashcard" ADD CONSTRAINT "Flashcard_setId_fkey" FOREIGN KEY ("setId") REFERENCES "public"."FlashcardSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
