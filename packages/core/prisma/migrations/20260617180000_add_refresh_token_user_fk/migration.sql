-- AddForeignKey
ALTER TABLE "ngc"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ngc"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
