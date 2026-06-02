-- Rename AgeRange enum values to match the current Prisma schema
-- Previously used dash-separated values (e.g., '18-24'), now using underscored prefix (e.g., 'age_18_24')
ALTER TYPE "ngc"."AgeRange" RENAME VALUE '18-24' TO 'age_18_24';
ALTER TYPE "ngc"."AgeRange" RENAME VALUE '25-34' TO 'age_25_34';
ALTER TYPE "ngc"."AgeRange" RENAME VALUE '35-49' TO 'age_35_49';
ALTER TYPE "ngc"."AgeRange" RENAME VALUE '50-64' TO 'age_50_64';
