/**
 * Empties every table of the database in a single query.
 */
export const emptyDatabase = async (prisma: RawQueryClient): Promise<void> => {
  await prisma.$executeRawUnsafe(DELETE_ALL_TABLES)
}

// Minimal structural type so that the raw client, the extended one and the
// client mocked in the vitest setups can all be passed in.
interface RawQueryClient {
  $executeRawUnsafe(query: string, ...values: unknown[]): Promise<number>
}

// Listing the tables and emptying them happens server side, in a single round
// trip, as this runs after every test.
//
// `DELETE` rather than `TRUNCATE`: the latter rewrites the relation file of
// every table and fsyncs it, which costs ~3ms per table whether or not it holds
// any row — around 100ms per call against a real PostgreSQL, versus 3ms here.
// Sequences are not reset as a result, which no model relies on (no
// `autoincrement()` in the schema).
//
// `session_replication_role` disables the foreign key triggers, so no deletion
// order has to be maintained — `DELETE`, unlike `TRUNCATE`, takes no `CASCADE`
// and checks every foreign key as it goes. `set_config(…, true)` scopes it to
// the transaction, which is the statement itself here, so it is back to
// `origin` as soon as the call returns. Beware that calling this *inside* a
// caller-managed transaction would keep the foreign keys disabled until that
// transaction ends.
//
// `_prisma_migrations` is left alone so that the migrated schema stays valid,
// and views are not concerned since only tables are listed.
const DELETE_ALL_TABLES = `
  DO $$
  DECLARE
    tables text;
  BEGIN
    PERFORM set_config('session_replication_role', 'replica', true);

    SELECT string_agg(format('%I.%I', schemaname, tablename), ', ')
    INTO tables
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      AND tablename <> '_prisma_migrations';

    IF tables IS NOT NULL THEN
      EXECUTE 'DELETE FROM ' || replace(tables, ', ', '; DELETE FROM ');
    END IF;
  END $$;
`
