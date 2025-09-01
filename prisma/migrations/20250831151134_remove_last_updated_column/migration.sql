/*
  Warnings:

  - You are about to drop the column `lastUpdated` on the `Note` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Note" DROP COLUMN "lastUpdated";
