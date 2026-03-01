-- CreateTable
CREATE TABLE "DepartmentAuthority" (
    "id" TEXT NOT NULL,
    "dept_name" TEXT NOT NULL,
    "hod_email" TEXT NOT NULL,
    "dean_email" TEXT NOT NULL,

    CONSTRAINT "DepartmentAuthority_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentAuthority_dept_name_key" ON "DepartmentAuthority"("dept_name");
