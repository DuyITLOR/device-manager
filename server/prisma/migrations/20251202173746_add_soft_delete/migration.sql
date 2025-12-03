-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Device_isDeleted_idx" ON "Device"("isDeleted");

-- CreateIndex
CREATE INDEX "Device_status_isDeleted_idx" ON "Device"("status", "isDeleted");

-- CreateIndex
CREATE INDEX "User_isDeleted_idx" ON "User"("isDeleted");

-- CreateIndex
CREATE INDEX "User_email_isDeleted_idx" ON "User"("email", "isDeleted");
