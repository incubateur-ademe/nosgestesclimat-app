import { PGlite } from '@electric-sql/pglite'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'

/**
 * The deduplication migration is a data migration: it only does something on a
 * database that still allows two rows to share a "VerifiedUser"."id". The
 * migrated test database cannot hold that state, so this test builds its own,
 * from the migrations that precede it, and then runs the two migrations of the
 * refactor in order. The primary key one is the assertion that matters: it
 * fails on a duplicate id.
 */

const MIGRATIONS_DIR = path.join('.', 'prisma', 'migrations')
const DEDUPLICATION = '20261112110000_verified_user_deduplicate_ids'
const PRIMARY_KEY = '20261112120000_verified_user_id_primary_key'

/** The accounts the test arbitrates, with the outcome the migration promises. */
const CHANGED_EMAIL_ID = '11111111-1111-1111-1111-111111111111'
const TWICE_SIGNED_UP_ID = '22222222-2222-2222-2222-222222222222'
const TWO_ADMINS_ID = '33333333-3333-3333-3333-333333333333'

const FIXTURES = `
  INSERT INTO ngc."User" (id, name, "updatedAt") VALUES
    ('${CHANGED_EMAIL_ID}', 'changed email', '2025-06-01'),
    ('${TWICE_SIGNED_UP_ID}', 'twice signed up', '2025-06-01'),
    ('${TWO_ADMINS_ID}', 'two admins', '2025-06-01');

  INSERT INTO ngc."VerifiedUser" (email, id, "updatedAt") VALUES
    ('old@example.fr', '${CHANGED_EMAIL_ID}', '2025-01-01'),
    ('new@example.fr', '${CHANGED_EMAIL_ID}', '2025-06-01'),
    ('dup1@example.fr', '${TWICE_SIGNED_UP_ID}', '2025-01-01'),
    ('dup2@example.fr', '${TWICE_SIGNED_UP_ID}', '2025-02-01'),
    ('admin1@example.fr', '${TWO_ADMINS_ID}', '2025-01-01'),
    ('admin2@example.fr', '${TWO_ADMINS_ID}', '2025-02-01');

  -- dup1 is the email the person still logs in with, despite the older row.
  INSERT INTO ngc."VerificationCode" (id, email, code, "expirationDate", "updatedAt", usage) VALUES
    ('99999999-0000-0000-0000-000000000001', 'dup1@example.fr', '111111', '2025-07-01', '2025-06-30', 'login'),
    ('99999999-0000-0000-0000-000000000002', 'dup2@example.fr', '222222', '2025-07-01', '2025-06-01', 'login');

  INSERT INTO ngc."Organisation" (id, name, slug, "updatedAt") VALUES
    ('org-1', 'Org 1', 'org-1', '2025-01-01'),
    ('org-2', 'Org 2', 'org-2', '2025-01-01');

  INSERT INTO ngc."OrganisationAdministrator" (id, "userEmail", "organisationId", "updatedAt") VALUES
    ('admin-changed', 'old@example.fr', 'org-1', '2025-01-01'),
    ('admin-1', 'admin1@example.fr', 'org-1', '2025-01-01'),
    ('admin-2', 'admin2@example.fr', 'org-2', '2025-01-01');
`

const readMigration = async (name: string): Promise<string> => {
  const sql = await readFile(
    path.join(MIGRATIONS_DIR, name, 'migration.sql'),
    'utf8'
  )

  // PGlite holds a single connection and cannot build an index concurrently.
  return sql.replaceAll('CREATE INDEX CONCURRENTLY', 'CREATE INDEX')
}

describe('VerifiedUser deduplication migration', () => {
  const db = new PGlite()

  afterAll(async () => {
    await db.close()
  })

  it('removes the duplicate ids and leaves the organisation administrators reachable', async () => {
    const migrations = (await readdir(MIGRATIONS_DIR))
      .filter((name) => name !== 'migration_lock.toml')
      .sort()

    for (const name of migrations.filter((name) => name < DEDUPLICATION)) {
      await db.exec(await readMigration(name))
    }

    await db.exec(FIXTURES)

    await db.exec(await readMigration(DEDUPLICATION))

    const verifiedUsers = await db.query<{ id: string; email: string }>(
      `SELECT id, email FROM ngc."VerifiedUser" ORDER BY email`
    )

    expect(verifiedUsers.rows).toHaveLength(4)

    // The email change before the refactor does not cost the organisation
    // administrator.
    expect(verifiedUsers.rows).toContainEqual({
      id: CHANGED_EMAIL_ID,
      email: 'new@example.fr',
    })

    // The most recent login decides, not the most recently written row.
    expect(verifiedUsers.rows).toContainEqual({
      id: TWICE_SIGNED_UP_ID,
      email: 'dup1@example.fr',
    })

    // Two organisation administrators of one id cannot both move to the
    // surviving email: the extra row keeps its own email under a new id.
    const admin1 = verifiedUsers.rows.find(
      (row) => row.email === 'admin1@example.fr'
    )
    expect(admin1?.id).not.toBe(TWO_ADMINS_ID)
    expect(verifiedUsers.rows).toContainEqual({
      id: TWO_ADMINS_ID,
      email: 'admin2@example.fr',
    })

    const organisationAdministrators = await db.query<{
      userEmail: string
      userId: string | null
    }>(`
      SELECT oa."userEmail", vu.id AS "userId"
      FROM ngc."OrganisationAdministrator" oa
      LEFT JOIN ngc."VerifiedUser" vu ON vu.email = oa."userEmail"
      ORDER BY oa."userEmail"
    `)

    expect(organisationAdministrators.rows).toEqual([
      { userEmail: 'admin1@example.fr', userId: admin1?.id },
      { userEmail: 'admin2@example.fr', userId: TWO_ADMINS_ID },
      { userEmail: 'new@example.fr', userId: CHANGED_EMAIL_ID },
    ])

    // The next migration is the point of this one: it fails on a duplicate id.
    await db.exec(await readMigration(PRIMARY_KEY))

    const primaryKey = await db.query<{ column: string }>(`
      SELECT a.attname AS column
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = '"ngc"."VerifiedUser"'::regclass
        AND i.indisprimary
    `)

    expect(primaryKey.rows).toEqual([{ column: 'id' }])
  })
})
