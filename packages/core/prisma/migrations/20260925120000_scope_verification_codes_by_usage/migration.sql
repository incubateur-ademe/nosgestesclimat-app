-- Verification codes are shared by several features (site login, newsletter
-- confirmation, integrations API token). Until now any non-expired code for
-- an email validated in any flow: a newsletter confirmation code could log a
-- user in. The new `usage` column scopes each row to the feature that created
-- it, and every code lookup filters on it.
--
-- Existing rows default to `login`: codes live at most 24 hours and the login
-- flow is the dominant creator, so codes handed out right before the deploy
-- keep working, while the cross-flow window closes as they expire.

-- CreateEnum
CREATE TYPE "ngc"."VerificationCodeUsage" AS ENUM ('login', 'newsletter', 'apiToken');

-- AlterTable
ALTER TABLE "ngc"."VerificationCode" ADD COLUMN "usage" "ngc"."VerificationCodeUsage" NOT NULL DEFAULT 'login';
