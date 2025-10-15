/*
  Warnings:

  - You are about to drop the column `name` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `fundingAgency` on the `StaffRecruitmentForm` table. All the data in the column will be lost.
  - You are about to drop the column `projectDuration` on the `StaffRecruitmentForm` table. All the data in the column will be lost.
  - You are about to drop the column `projectTitle` on the `StaffRecruitmentForm` table. All the data in the column will be lost.
  - Added the required column `fundingAgency` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectDuration` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "name",
ADD COLUMN     "fundingAgency" TEXT NOT NULL,
ADD COLUMN     "projectDuration" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StaffRecruitmentForm" DROP COLUMN "fundingAgency",
DROP COLUMN "projectDuration",
DROP COLUMN "projectTitle";
