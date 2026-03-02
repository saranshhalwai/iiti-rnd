/*
  Warnings:

  - You are about to drop the column `deanEmail` on the `StaffRecruitmentForm` table. All the data in the column will be lost.
  - You are about to drop the column `hodEmail` on the `StaffRecruitmentForm` table. All the data in the column will be lost.
  - Added the required column `deanEmail` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hodEmail` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "deanEmail" TEXT NOT NULL,
ADD COLUMN     "hodEmail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StaffRecruitmentForm" DROP COLUMN "deanEmail",
DROP COLUMN "hodEmail";
