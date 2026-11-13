import { PGlite } from '@electric-sql/pglite'
import { readFile, readdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  deduplicateVerifiedUsers,
  type DeduplicationClient,
} from '../NGC-4121-20261112.ts'

/**
 * The deduplication only does something on a database that holds several rows
 * sharing a "VerifiedUser"."id". The migrated test database cannot hold that
 * state, so this test builds its own from the project's migrations, seeds the
 * duplicates and the organisation administrators the script has to arbitrate,
 * and runs it.
 */

const require = createRequire(import.meta.url)
const coreMain = require.resolve('@nosgestesclimat/core')
const MIGRATIONS_DIR = path.join(
  path.dirname(coreMain),
  '..',
  'prisma',
  'migrations'
)

/** The accounts the test arbitrates, with the outcome the script promises. */
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

/**
 * The script talks to the client through raw statements: this exposes PGlite
 * the same way, with the transaction the writes are wrapped in.
 */
const clientOf = (pg: PGlite): DeduplicationClient => {
  const client: DeduplicationClient = {
    $queryRawUnsafe: async <T>(query: string): Promise<T> =>
      (await pg.query(query)).rows as T,
    $executeRawUnsafe: (query: string) => pg.exec(query),
    $transaction: async (transaction) => {
      await pg.exec('BEGIN')
      try {
        await transaction({ $executeRawUnsafe: client.$executeRawUnsafe })
        await pg.exec('COMMIT')
      } catch (error) {
        await pg.exec('ROLLBACK')
        throw error
      }
    },
  }

  return client
}

const readMigration = async (name: string): Promise<string> => {
  const sql = await readFile(
    path.join(MIGRATIONS_DIR, name, 'migration.sql'),
    'utf8'
  )

  // PGlite holds a single connection and cannot build an index concurrently.
  return sql.replaceAll('CREATE INDEX CONCURRENTLY', 'CREATE INDEX')
}

describe('deduplicateVerifiedUsers', () => {
  const pg = new PGlite()
  const client = clientOf(pg)

  const verifiedUsersOf = async () =>
    (
      await pg.query<{ id: string; email: string }>(
        `SELECT id, email FROM ngc."VerifiedUser" ORDER BY email`
      )
    ).rows

  beforeAll(async () => {
    const migrations = (await readdir(MIGRATIONS_DIR))
      .filter((name) => name !== 'migration_lock.toml')
      .sort()

    for (const name of migrations) {
      await pg.exec(await readMigration(name))
    }

    await pg.exec(FIXTURES)
  })

  afterAll(async () => {
    await pg.close()
  })

  it('leaves one row per id and no organisation administrator pointing at a deleted email', async () => {
    const before = await verifiedUsersOf()

    await deduplicateVerifiedUsers({ client })

    expect(await verifiedUsersOf()).toEqual(before)

    const checks = await deduplicateVerifiedUsers({ client, dry: false })

    expect(checks).toEqual({
      duplicateIds: 0,
      extraRows: 0,
      orphanOrganisationAdministrators: 0,
      accountsWithSeveralOrganisationAdministrators: 0,
    })

    const duplicates = await pg.query<{ id: string }>(
      `SELECT id FROM ngc."VerifiedUser" GROUP BY id HAVING COUNT(*) > 1`
    )
    expect(duplicates.rows).toEqual([])

    const orphans = await pg.query<{ id: string }>(`
      SELECT oa.id
        FROM ngc."OrganisationAdministrator" oa
        LEFT JOIN ngc."VerifiedUser" vu ON vu.email = oa."userEmail"
       WHERE vu.email IS NULL
    `)
    expect(orphans.rows).toEqual([])

    const verifiedUsers = await verifiedUsersOf()

    // new/old, dup1, admin1, admin2, solo
    expect(verifiedUsers).toHaveLength(5)

    // The most recent login decides, not the most recently written row, and
    // the administration follows the surviving email.
    expect(verifiedUsers).toContainEqual({
      id: TWICE_SIGNED_UP_ID,
      email: 'dup1@example.fr',
    })

    expect(verifiedUsers).toContainEqual({
      id: FRESH_EMAIL_ID,
      email: 'new@example.fr',
    })

    // Two organisation administrators of one id cannot both move to the
    // surviving email: the extra row keeps its own email under a new id.
    const admin1 = verifiedUsers.find(
      (row) => row.email === 'admin1@example.fr'
    )
    expect(admin1?.id).not.toBe(TWO_ADMINS_ID)
    expect(verifiedUsers).toContainEqual({
      id: TWO_ADMINS_ID,
      email: 'admin2@example.fr',
    })

    // A row whose id is not duplicated is left as it was.
    expect(verifiedUsers).toContainEqual({
      id: UNTOUCHED_ID,
      email: 'solo@example.fr',
    })

    const organisationAdministrators = await pg.query<{
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
    // checks that the script does not add one.
    const users = await pg.query<{ email: string | null }>(
      `SELECT email FROM ngc."User" WHERE id = '${FRESH_EMAIL_ID}'`
    )
    expect(users.rows).toEqual([{ email: null }])

    // A second run finds nothing to do.
    await deduplicateVerifiedUsers({ client, dry: false })
    expect(await verifiedUsersOf()).toEqual(verifiedUsers)
    expect(
      (
        await pg.query<{ count: number }>(
          `SELECT COUNT(*)::int AS count FROM ngc."User"`
        )
      ).rows
    ).toEqual([{ count: 5 }])
  })
})
