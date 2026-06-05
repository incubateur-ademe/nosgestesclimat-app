ALTER DOMAIN "ngc"."MODEL" DROP CONSTRAINT "MODEL_check";
ALTER DOMAIN "ngc"."MODEL" ADD CONSTRAINT "MODEL_check" CHECK ( VALUE ~ '^[A-Z]+-[a-z]+-pr-\d+$' OR VALUE ~ '^[A-Z]+-[a-z]+-\d+\.\d+\.\d+(-[\w.]+)?$' );
