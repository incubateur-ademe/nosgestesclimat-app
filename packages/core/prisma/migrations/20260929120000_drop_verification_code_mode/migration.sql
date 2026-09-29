-- The `mode` column was the pre-`usage` signIn/signUp discriminator. It is
-- long deprecated: the sign-in/sign-up outcome is computed at login time from
-- whether the email already owns a verified account, so every code created by
-- the current flows stores `NULL`. `usage` is the single discriminator now, and
-- codes expire within 24 hours, so no live row depends on the column.

-- AlterTable
ALTER TABLE "ngc"."VerificationCode" DROP COLUMN "mode";

-- DropEnum
DROP TYPE "ngc"."VerificationCodeMode";
