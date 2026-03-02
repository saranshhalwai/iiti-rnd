/*
  Warnings:

  - Added the required column `deanEmail` to the `StaffRecruitmentForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hodEmail` to the `StaffRecruitmentForm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StaffRecruitmentForm" ADD COLUMN     "deanEmail" TEXT NOT NULL,
ADD COLUMN     "hodEmail" TEXT NOT NULL;
