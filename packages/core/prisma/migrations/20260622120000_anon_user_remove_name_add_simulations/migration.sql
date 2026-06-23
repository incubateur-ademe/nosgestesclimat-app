-- RedefineView: remove "name" column from AnonUser view
DROP VIEW IF EXISTS "ngc_anon"."User";
CREATE VIEW "ngc_anon"."User" AS
SELECT
    "id",
    "ageRange",
    "createdAt",
    "updatedAt"
FROM "ngc"."User";
