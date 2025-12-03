/*
  Warnings:

  - The values [PENDING] on the enum `FormStatus` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('HOD_CONFIRMED', 'DEAN_CONFIRMED', 'HOD_PENDING', 'DEAN_PENDING', 'HOD_REJECTED', 'DEAN_REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "FormStatus_new" AS ENUM ('SAVED', 'PENDING_HOD', 'PENDING_DEAN', 'REJECTED', 'APPROVED');
ALTER TABLE "public"."StaffRecruitmentForm" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "StaffRecruitmentForm" ALTER COLUMN "status" TYPE "FormStatus_new" USING ("status"::text::"FormStatus_new");
ALTER TYPE "FormStatus" RENAME TO "FormStatus_old";
ALTER TYPE "FormStatus_new" RENAME TO "FormStatus";
DROP TYPE "public"."FormStatus_old";
ALTER TABLE "StaffRecruitmentForm" ALTER COLUMN "status" SET DEFAULT 'SAVED';
COMMIT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "status",
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'HOD_PENDING';

-- AlterTable
ALTER TABLE "StaffRecruitmentForm" ALTER COLUMN "status" SET DEFAULT 'SAVED';
