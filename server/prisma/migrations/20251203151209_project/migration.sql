/*
  Warnings:

  - The values [REJECTED] on the enum `FormStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [HOD_CONFIRMED,DEAN_CONFIRMED,HOD_PENDING,DEAN_PENDING,HOD_REJECTED,DEAN_REJECTED] on the enum `ProjectStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FormStatus_new" AS ENUM ('SAVED', 'PENDING_HOD', 'REJECTED_HOD', 'PENDING_DEAN', 'REJECTED_DEAN', 'APPROVED');
ALTER TABLE "public"."StaffRecruitmentForm" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "StaffRecruitmentForm" ALTER COLUMN "status" TYPE "FormStatus_new" USING ("status"::text::"FormStatus_new");
ALTER TYPE "FormStatus" RENAME TO "FormStatus_old";
ALTER TYPE "FormStatus_new" RENAME TO "FormStatus";
DROP TYPE "public"."FormStatus_old";
ALTER TABLE "StaffRecruitmentForm" ALTER COLUMN "status" SET DEFAULT 'SAVED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProjectStatus_new" AS ENUM ('SAVED', 'PENDING_HOD', 'REJECTED_HOD', 'PENDING_DEAN', 'REJECTED_DEAN', 'APPROVED');
ALTER TABLE "public"."Project" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Project" ALTER COLUMN "status" TYPE "ProjectStatus_new" USING ("status"::text::"ProjectStatus_new");
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";
ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";
DROP TYPE "public"."ProjectStatus_old";
ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT 'SAVED';
COMMIT;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT 'SAVED';
