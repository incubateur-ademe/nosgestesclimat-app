-- Make userId nullable in GroupParticipant table
ALTER TABLE "ngc"."GroupParticipant" ALTER COLUMN "userId" DROP NOT NULL;

-- Update foreign key to SET NULL on delete (was RESTRICT)
ALTER TABLE "ngc"."GroupParticipant" DROP CONSTRAINT "GroupParticipant_userId_fkey";
ALTER TABLE "ngc"."GroupParticipant" ADD CONSTRAINT "GroupParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ngc"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
