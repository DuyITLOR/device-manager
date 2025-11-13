/*
  Warnings:

  - The values [AUTH_LOGIN,AUTH_LOGOUT] on the enum `ActivityAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActivityAction_new" AS ENUM ('LOAN_CREATE', 'LOAN_RETURN', 'TRANSFER_REQUEST', 'TRANSFER_APPROVE', 'TRANSFER_REJECT', 'TRANSFER_CANCEL', 'DEVICE_CREATE', 'DEVICE_UPDATE', 'DEVICE_DELETE', 'USER_CREATE', 'USER_DELETE');
ALTER TABLE "ActivityLog" ALTER COLUMN "action" TYPE "ActivityAction_new" USING ("action"::text::"ActivityAction_new");
ALTER TYPE "ActivityAction" RENAME TO "ActivityAction_old";
ALTER TYPE "ActivityAction_new" RENAME TO "ActivityAction";
DROP TYPE "public"."ActivityAction_old";
COMMIT;
