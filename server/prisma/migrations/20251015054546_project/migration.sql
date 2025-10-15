/*
  Warnings:

  - You are about to drop the column `hodSignature` on the `StaffRecruitmentForm` table. All the data in the column will be lost.
  - You are about to drop the column `rndDeanSignature` on the `StaffRecruitmentForm` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StaffRecruitmentForm" DROP COLUMN "hodSignature",
DROP COLUMN "rndDeanSignature";
