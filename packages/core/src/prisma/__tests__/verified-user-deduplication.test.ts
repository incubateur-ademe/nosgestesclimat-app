import { PGlite } from '@electric-sql/pglite'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'

/**
 * The deduplication is a data migration: it only does something on a database
 * that still allows two rows to share a "VerifiedUser"."id". The migrated test
 * database cannot hold that state, so this test builds its own from the
 * migrations that precede it, seeds the duplicates and the organisation
 * administrators the migration has to arbitrate, and runs it.
 */

const MIGRATIONS_DIR = path.join('.', 'prisma', 'migrations')
const DEDUPLICATION = '20261112110000_verified_user_deduplicate_ids'

/** The accounts the test arbitrates, with the outcome the migration promises. */
const FRESH_EMAIL_ID = '11111111-1111-1111-1111-111111111111'
const TWICE_SIGNED_UP_ID = '22222222-2222-2222-2222-222222222222'
const TWO_ADMINS_ID = '33333333-3333-3333-3333-333333333333'
const UNTOUCHED_ID = '44444444-4444-4444-4444-444444444444'

const FIXTURES = `
  INSERT INTO ngc."User" (id, name, "updatedAt") VALUES
    ('${FRESH_EMAIL_ID}', 'fresh email', '2025-06-01'),
    ('${TWICE_SIGNED_UP_ID}', 'twice signed up', '2025-06-01'),
    ('${TWO_ADMINS_ID}', 'two admins', '2025-06-01'),
    ('${UNTOUCHED_ID}', 'untouched', '2025-06-01');

  INSERT INTO ngc."VerifiedUser" (email, id, "updatedAt") VALUES
    ('old@example.fr', '${FRESH_EMAIL_ID}', '2025-01-01'),
    ('new@example.fr', '${FRESH_EMAIL_ID}', '2025-06-01'),
    ('dup1@example.fr', '${TWICE_SIGNED_UP_ID}', '2025-01-01'),
    ('dup2@example.fr', '${TWICE_SIGNED_UP_ID}', '2025-02-01'),
    ('admin1@example.fr', '${TWO_ADMINS_ID}', '2025-01-01'),
    ('admin2@example.fr', '${TWO_ADMINS_ID}', '2025-02-01'),
    ('solo@example.fr', '${UNTOUCHED_ID}', '2025-01-01');

  -- dup1 is the email the person still logs in with, despite the older row.
  INSERT INTO ngc."VerificationCode" (id, email, code, "expirationDate", "updatedAt", usage) VALUES
    ('99999999-0000-0000-0000-000000000001', 'dup1@example.fr', '111111', '2025-07-01', '2025-06-30', 'login'),
    ('99999999-0000-0000-0000-000000000002', 'dup2@example.fr', '222222', '2025-07-01', '2025-06-01', 'login');

  INSERT INTO ngc."Organisation" (id, name, slug, "updatedAt") VALUES
    ('org-1', 'Org 1', 'org-1', '2025-01-01'),
    ('org-2', 'Org 2', 'org-2', '2025-01-01');

  INSERT INTO ngc."OrganisationAdministrator" (id, "userEmail", "organisationId", "updatedAt") VALUES
    ('admin-old', 'old@example.fr', 'org-1', '2025-01-01'),
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

const verifiedUsersOf = (db: PGlite) =>
  db.query<{ id: string; email: string }>(
    `SELECT id, email FROM ngc."VerifiedUser" ORDER BY email`
  )

describe('VerifiedUser deduplication migration', () => {
  const db = new PGlite()

  afterAll(async () => {
    await db.close()
  })

  it('leaves one row per id and no organisation administrator pointing at a deleted email', async () => {
    const migrations = (await readdir(MIGRATIONS_DIR))
      .filter((name) => name !== 'migration_lock.toml')
      .sort()

    for (const name of migrations.filter((name) => name < DEDUPLICATION)) {
      await db.exec(await readMigration(name))
    }

    await db.exec(FIXTURES)

    const migration = await readMigration(DEDUPLICATION)
    await db.exec(migration)

    const duplicates = await db.query<{ id: string }>(
      `SELECT id FROM ngc."VerifiedUser" GROUP BY id HAVING COUNT(*) > 1`
    )
    expect(duplicates.rows).toEqual([])

    const orphans = await db.query<{ id: string }>(`
      SELECT oa.id
        FROM ngc."OrganisationAdministrator" oa
        LEFT JOIN ngc."VerifiedUser" vu ON vu.email = oa."userEmail"
       WHERE vu.email IS NULL
    `)
    expect(orphans.rows).toEqual([])

    const verifiedUsers = await verifiedUsersOf(db)

    // new/old, dup1, admin1, admin2, solo
    expect(verifiedUsers.rows).toHaveLength(5)

    // The most recent login decides, not the most recently written row, and
    // the administration follows the surviving email.
    expect(verifiedUsers.rows).toContainEqual({
      id: TWICE_SIGNED_UP_ID,
      email: 'dup1@example.fr',
    })

    expect(verifiedUsers.rows).toContainEqual({
      id: FRESH_EMAIL_ID,
      email: 'new@example.fr',
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

    // A row whose id is not duplicated is left as it was.
    expect(verifiedUsers.rows).toContainEqual({
      id: UNTOUCHED_ID,
      email: 'solo@example.fr',
    })

    const organisationAdministrators = await db.query<{
      userEmail: string
      userId: string
    }>(`
      SELECT oa."userEmail", vu.id AS "userId"
      FROM ngc."OrganisationAdministrator" oa
      JOIN ngc."VerifiedUser" vu ON vu.email = oa."userEmail"
      ORDER BY oa."userEmail"
    `)

    expect(organisationAdministrators.rows).toEqual([
      { userEmail: 'admin1@example.fr', userId: admin1?.id },
      { userEmail: 'admin2@example.fr', userId: TWO_ADMINS_ID },
      { userEmail: 'new@example.fr', userId: FRESH_EMAIL_ID },
    ])

    // "User"."email" mirrors the surviving verified email. The fixture leaves
    // it empty - a column that holds NULL never satisfies "<>" - so this only
    // checks that the migration does not add one.
    const users = await db.query<{ email: string | null }>(
      `SELECT email FROM ngc."User" WHERE id = '${FRESH_EMAIL_ID}'`
    )
    expect(users.rows).toEqual([{ email: null }])

    // A second run finds nothing to do.
    await db.exec(migration)
    expect((await verifiedUsersOf(db)).rows).toEqual(verifiedUsers.rows)
    expect(
      (
        await db.query<{ count: number }>(
          `SELECT COUNT(*)::int AS count FROM ngc."User"`
        )
      ).rows
    ).toEqual([{ count: 5 }])
  })
})
