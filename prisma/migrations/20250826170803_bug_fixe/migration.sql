/*
  Warnings:

  - A unique constraint covering the columns `[id,studentId]` on the table `Note` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Note_id_studentId_key" ON "public"."Note"("id", "studentId");
