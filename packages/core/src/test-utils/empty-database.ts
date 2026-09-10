/**
 * Empties every table of the database in a single query.
 */
export const emptyDatabase = async (prisma: RawQueryClient): Promise<void> => {
  await prisma.$executeRawUnsafe(TRUNCATE_ALL_TABLES)
}

// Minimal structural type so that the raw client, the extended one and the
// client mocked in the vitest setups can all be passed in.
interface RawQueryClient {
  $executeRawUnsafe(query: string, ...values: unknown[]): Promise<number>
}

// Listing the tables and truncating them happens server side, in a single
// round trip, as this runs after every test.
//
// `_prisma_migrations` is left alone so that the migrated schema stays valid,
// and views are not concerned since only tables are listed. `CASCADE` makes the
// foreign keys irrelevant, so no deletion order has to be maintained.
const TRUNCATE_ALL_TABLES = `
  DO $$
  DECLARE
    tables text;
  BEGIN
    SELECT string_agg(format('%I.%I', schemaname, tablename), ', ')
    INTO tables
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      AND tablename <> '_prisma_migrations';

    IF tables IS NOT NULL THEN
      EXECUTE 'TRUNCATE TABLE ' || tables || ' RESTART IDENTITY CASCADE';
    END IF;
  END $$;
`
