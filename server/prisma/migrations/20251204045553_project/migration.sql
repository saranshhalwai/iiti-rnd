-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('PENDING', 'SAVED', 'PENDING_HOD', 'REJECTED_HOD', 'PENDING_DEAN', 'REJECTED_DEAN', 'APPROVED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'SAVED', 'PENDING_HOD', 'REJECTED_HOD', 'PENDING_DEAN', 'REJECTED_DEAN', 'APPROVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lastVisit" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userEmail" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fundingAgency" TEXT NOT NULL,
    "projectDuration" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'SAVED',

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffRecruitmentForm" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "selectionCommittee" JSONB NOT NULL,
    "status" "FormStatus" NOT NULL DEFAULT 'SAVED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "StaffRecruitmentForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffRecruitmentForm" ADD CONSTRAINT "StaffRecruitmentForm_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
