-- CreateView MatomoStats
CREATE OR REPLACE VIEW "ngc_anon"."MatomoStats" AS
SELECT
    "id",
    "date",
    "source",
    "kind",
    "referrer",
    "device",
    "iframe",
    "visits",
    "firstAnswer",
    "finishedSimulations"
FROM "ngc"."MatomoStats";