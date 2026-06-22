-- RedefineView: remove "name" column from AnonUser view
CREATE OR REPLACE VIEW "ngc_anon"."User" AS
SELECT
    "id",
    "ageRange",
    "createdAt",
    "updatedAt"
FROM "ngc"."User";
