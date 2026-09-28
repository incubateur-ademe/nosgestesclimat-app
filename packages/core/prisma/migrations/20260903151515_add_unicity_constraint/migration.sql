ALTER TABLE "ngc"."VerifiedUser" ADD CONSTRAINT "VerifiedUser_id_unique" UNIQUE ("id");

ALTER TABLE "ngc"."User" ADD CONSTRAINT "User_id_unique" UNIQUE ("id");
