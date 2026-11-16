import { PGlite } from '@electric-sql/pglite'
import { readFile, readdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import logger from '../../src/logger.ts'
import {
  deduplicateVerifiedUsers,
  exitCodeOfRun,
  readDryFlag,
  type VerifiedUserDeduplicationClient,
} from '../NGC-4121-20261112.ts'

/**
 * The deduplication only does something on a database that holds several rows
 * sharing a "VerifiedUser"."id". The migrated test database cannot hold that
 * state, so this test builds its own from the project's migrations, seeds the
 * duplicates and the organisation administrators the script has to arbitrate,
 * and runs it.
 */

/** The accounts the test arbitrates, with the outcome the script promises. */
const FRESH_EMAIL_ID = '11111111-1111-1111-1111-111111111111'
const TWICE_SIGNED_UP_ID = '22222222-2222-2222-2222-222222222222'
const TWO_ADMINS_ID = '33333333-3333-3333-3333-333333333333'
const UNTOUCHED_ID = '44444444-4444-4444-4444-444444444444'
const THREE_ROWS_ID = '55555555-5555-5555-5555-555555555555'
const TIE_ID = '66666666-6666-6666-6666-666666666666'
const LOGIN_CODE_ID = '77777777-7777-7777-7777-777777777777'

const FIXTURES = `
  INSERT INTO ngc."User" (id, name, email, "lastActivityAt", "updatedAt") VALUES
    ('${FRESH_EMAIL_ID}', 'fresh email', NULL, NULL, '2025-06-01'),
    ('${TWICE_SIGNED_UP_ID}', 'twice signed up', 'dup2@example.fr', NULL, '2025-06-01'),
    ('${TWO_ADMINS_ID}', 'two admins', NULL, '2025-05-05', '2025-06-01'),
    ('${UNTOUCHED_ID}', 'untouched', NULL, NULL, '2025-06-01'),
    ('${THREE_ROWS_ID}', 'three rows', NULL, '2025-04-04', '2025-06-01'),
    ('${TIE_ID}', 'tie', NULL, NULL, '2025-06-01'),
    ('${LOGIN_CODE_ID}', 'login code', NULL, NULL, '2025-06-01');

  INSERT INTO ngc."VerifiedUser" (email, id, "updatedAt") VALUES
    ('old@example.fr', '${FRESH_EMAIL_ID}', '2025-01-01'),
    ('new@example.fr', '${FRESH_EMAIL_ID}', '2025-06-01'),
    ('dup1@example.fr', '${TWICE_SIGNED_UP_ID}', '2025-01-01'),
    ('dup2@example.fr', '${TWICE_SIGNED_UP_ID}', '2025-02-01'),
    ('admin1@example.fr', '${TWO_ADMINS_ID}', '2025-01-01'),
    ('admin2@example.fr', '${TWO_ADMINS_ID}', '2025-02-01'),
    ('solo@example.fr', '${UNTOUCHED_ID}', '2025-01-01'),
    ('surv3@example.fr', '${THREE_ROWS_ID}', '2025-06-01'),
    ('a3@example.fr', '${THREE_ROWS_ID}', '2025-03-01'),
    ('b3@example.fr', '${THREE_ROWS_ID}', '2025-02-01'),
    ('zzz@example.fr', '${TIE_ID}', '2025-01-01'),
    ('aaa@example.fr', '${TIE_ID}', '2025-01-01'),
    ('login@example.fr', '${LOGIN_CODE_ID}', '2025-02-01'),
    ('recent@example.fr', '${LOGIN_CODE_ID}', '2025-06-01');

  -- dup1 is the email the person still logs in with, despite the older row.
  -- The code of zzz is not a login code: it must not rank the row. The login
  -- code of login is older than every other date and still ranks its row
  -- first, because a row without a login code comes last.
  INSERT INTO ngc."VerificationCode" (id, email, code, "expirationDate", "updatedAt", usage) VALUES
    ('99999999-0000-0000-0000-000000000001', 'dup1@example.fr', '111111', '2025-07-01', '2025-06-30', 'login'),
    ('99999999-0000-0000-0000-000000000002', 'dup2@example.fr', '222222', '2025-07-01', '2025-06-01', 'login'),
    ('99999999-0000-0000-0000-000000000003', 'zzz@example.fr', '333333', '2025-07-01', '2025-06-30', 'newsletter'),
    ('99999999-0000-0000-0000-000000000004', 'login@example.fr', '444444', '2025-07-01', '2024-06-01', 'login'),
    ('99999999-0000-0000-0000-000000000005', 'recent@example.fr', '555555', '2025-07-01', '2025-06-30', 'newsletter');

  INSERT INTO ngc."Organisation" (id, name, slug, "updatedAt") VALUES
    ('org-1', 'Org 1', 'org-1', '2025-01-01'),
    ('org-2', 'Org 2', 'org-2', '2025-01-01'),
    ('org-3', 'Org 3', 'org-3', '2025-01-01');

  -- a3 and b3 both hold an administration of a row sharing THREE_ROWS_ID: the
  -- first of them takes the surviving email, the second cannot.
  INSERT INTO ngc."OrganisationAdministrator" (id, "userEmail", "organisationId", "createdAt", "updatedAt") VALUES
    ('admin-old', 'old@example.fr', 'org-1', '2024-01-01', '2025-01-01'),
    ('admin-1', 'admin1@example.fr', 'org-1', '2024-02-01', '2025-01-01'),
    ('admin-2', 'admin2@example.fr', 'org-2', '2024-03-01', '2025-01-01'),
    ('admin-a3', 'a3@example.fr', 'org-3', '2024-04-01', '2025-01-01'),
    ('admin-b3', 'b3@example.fr', 'org-2', '2024-05-01', '2025-01-01');
`

/**
 * Empties the tables the fixtures fill, in the order the foreign keys require,
 * so every test reads the same seeded database.
 */
const RESET = `
  DELETE FROM ngc."OrganisationAdministrator";
  DELETE FROM ngc."VerificationCode";
  DELETE FROM ngc."VerifiedUser";
  DELETE FROM ngc."Organisation";
  DELETE FROM ngc."User";
`

const NO_ANOMALY = {
  duplicatedVerifiedUserIds: 0,
  redundantVerifiedUserRows: 0,
  orphanOrganisationAdministrators: 0,
  verifiedUserIdsWithSeveralOrganisationAdministrators: 0,
}

const USER_COLUMNS = `id, email, name, "lastActivityAt", "createdAt", "updatedAt"`

interface UserRow {
  id: string
  email: string | null
  name: string | null
  lastActivityAt: Date | null
  createdAt: Date
  updatedAt: Date
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

  const organisationAdministratorsOf = async () =>
    (
      await pg.query<{
        id: string
        userEmail: string
        organisationId: string
        createdAt: Date
      }>(
        `SELECT id, "userEmail", "organisationId", "createdAt" FROM ngc."OrganisationAdministrator" ORDER BY id`
      )
    ).rows

  const userById = async (id: string) =>
    (
      await pg.query<UserRow>(
        `SELECT ${USER_COLUMNS} FROM ngc."User" WHERE id = $1`,
        [id]
      )
    ).rows[0]

  const userByEmail = async (email: string) =>
    (
      await pg.query<UserRow>(
        `SELECT ${USER_COLUMNS} FROM ngc."User" WHERE email = $1`,
        [email]
      )
    ).rows[0]

  const usersOf = async () =>
    (
      await pg.query<UserRow>(
        `SELECT ${USER_COLUMNS} FROM ngc."User" ORDER BY id`
      )
    ).rows

  beforeAll(async () => {
    const migrations = (await readdir(MIGRATIONS_DIR))
      .filter((name) => name !== 'migration_lock.toml')
      .sort()

    for (const name of migrations) {
      await pg.exec(await readMigration(name))
    }
  })

  beforeEach(async () => {
    vi.mocked(logger.info).mockClear()
    await pg.exec(RESET)
    await pg.exec(FIXTURES)
  })

  afterAll(async () => {
    await pg.close()
  })

  it('reports the anomalies of the seeded database and writes nothing in dry mode', async () => {
    const before = await verifiedUsersOf()

    const remainingAnomalies = await deduplicateVerifiedUsers({ client })

    expect(remainingAnomalies).toEqual({
      duplicatedVerifiedUserIds: 6,
      redundantVerifiedUserRows: 7,
      orphanOrganisationAdministrators: 0,
      verifiedUserIdsWithSeveralOrganisationAdministrators: 2,
    })

    expect(await verifiedUsersOf()).toEqual(before)
  })

  it('reports the arbitration action of every row in dry mode', async () => {
    await deduplicateVerifiedUsers({ client })

    // The winston mock records the message and the metadata of every call.
    const loggedCalls = vi.mocked(logger.info).mock.calls as unknown as [
      string,
      Record<string, unknown>,
    ][]

    const planSummary = loggedCalls.find(
      ([message]) => message === 'VerifiedUser deduplication plan'
    )
    expect(planSummary?.[1]).toEqual({
      rows: 13,
      rowsByArbitrationAction: {
        keep_email_under_current_id: 6,
        delete_redundant_verified_user: 3,
        move_organisation_administrator_to_surviving_email: 2,
        keep_email_under_fresh_id: 2,
      },
    })

    const planRows = loggedCalls
      .filter(([message]) => message === 'VerifiedUser deduplication plan row')
      .map(
        ([, details]) =>
          details as { verifiedUserEmail: string; arbitrationAction: string }
      )

    const actionByEmail = new Map(
      planRows.map(({ verifiedUserEmail, arbitrationAction }) => [
        verifiedUserEmail,
        arbitrationAction,
      ])
    )

    // One row per case the header of the script documents.
    expect(actionByEmail.get('new@example.fr')).toBe(
      'keep_email_under_current_id'
    )
    expect(actionByEmail.get('dup2@example.fr')).toBe(
      'delete_redundant_verified_user'
    )
    expect(actionByEmail.get('old@example.fr')).toBe(
      'move_organisation_administrator_to_surviving_email'
    )
    expect(actionByEmail.get('a3@example.fr')).toBe(
      'move_organisation_administrator_to_surviving_email'
    )
    expect(actionByEmail.get('admin1@example.fr')).toBe(
      'keep_email_under_fresh_id'
    )
    expect(actionByEmail.get('b3@example.fr')).toBe('keep_email_under_fresh_id')

    expect(planRows).toHaveLength(13)
    // An id held once carries no arbitration.
    expect(actionByEmail.has('solo@example.fr')).toBe(false)
  })

  it('counts an administrator row whose email no "VerifiedUser" row holds', async () => {
    // The foreign key makes the state impossible in production: the count is
    // the guard that reports it if the constraint is ever missing.
    const foreignKey = '"OrganisationAdministrator_userEmail_fkey"'
    await pg.exec(
      `ALTER TABLE ngc."OrganisationAdministrator" DROP CONSTRAINT ${foreignKey}`
    )

    try {
      await pg.exec(
        `INSERT INTO ngc."OrganisationAdministrator" (id, "userEmail", "organisationId", "updatedAt") VALUES ('admin-orphan', 'missing@example.fr', 'org-1', '2025-01-01')`
      )

      const remainingAnomalies = await deduplicateVerifiedUsers({ client })

      expect(remainingAnomalies).toEqual({
        duplicatedVerifiedUserIds: 6,
        redundantVerifiedUserRows: 7,
        orphanOrganisationAdministrators: 1,
        verifiedUserIdsWithSeveralOrganisationAdministrators: 2,
      })
    } finally {
      await pg.exec(
        `DELETE FROM ngc."OrganisationAdministrator" WHERE id = 'admin-orphan'`
      )
      await pg.exec(
        `ALTER TABLE ngc."OrganisationAdministrator" ADD CONSTRAINT ${foreignKey} FOREIGN KEY ("userEmail") REFERENCES ngc."VerifiedUser"("email") ON DELETE RESTRICT ON UPDATE CASCADE`
      )
    }
  })

  it('leaves one row per id and no organisation administrator pointing at a deleted email', async () => {
    const remainingAnomalies = await deduplicateVerifiedUsers({
      client,
      dry: false,
    })

    expect(remainingAnomalies).toEqual(NO_ANOMALY)

    const duplicates = await pg.query<{ id: string }>(
      `SELECT id FROM ngc."VerifiedUser" GROUP BY id HAVING COUNT(*) > 1`
    )
    expect(duplicates.rows).toEqual([])

    const orphanOrganisationAdministrators = await pg.query<{ id: string }>(`
      SELECT oa.id
        FROM ngc."OrganisationAdministrator" oa
        LEFT JOIN ngc."VerifiedUser" vu ON vu.email = oa."userEmail"
       WHERE vu.email IS NULL
    `)
    expect(orphanOrganisationAdministrators.rows).toEqual([])

    const verifiedUsers = await verifiedUsersOf()

    // new, dup1, admin1 under a new id, admin2, solo, surv3, b3 under a new
    // id, aaa, login
    expect(verifiedUsers).toHaveLength(9)

    const idByEmail = new Map(verifiedUsers.map(({ email, id }) => [email, id]))

    // The most recent login decides, not the most recently written row.
    expect(idByEmail.get('dup1@example.fr')).toBe(TWICE_SIGNED_UP_ID)
    expect(idByEmail.has('dup2@example.fr')).toBe(false)

    expect(idByEmail.get('new@example.fr')).toBe(FRESH_EMAIL_ID)
    expect(idByEmail.has('old@example.fr')).toBe(false)

    expect(idByEmail.get('surv3@example.fr')).toBe(THREE_ROWS_ID)
    expect(idByEmail.has('a3@example.fr')).toBe(false)

    // Two organisation administrators of one id cannot both move to the
    // surviving email: the extra row keeps its own email under a new id.
    expect(idByEmail.get('admin2@example.fr')).toBe(TWO_ADMINS_ID)
    expect(idByEmail.get('admin1@example.fr')).not.toBe(TWO_ADMINS_ID)

    expect(idByEmail.get('b3@example.fr')).not.toBe(THREE_ROWS_ID)
    expect(idByEmail.get('admin1@example.fr')).not.toBe(
      idByEmail.get('b3@example.fr')
    )

    // The newsletter code of zzz does not rank it, and the equal "updatedAt"
    // leaves the alphabetically first email as the survivor.
    expect(idByEmail.get('aaa@example.fr')).toBe(TIE_ID)
    expect(idByEmail.has('zzz@example.fr')).toBe(false)

    // An older login code beats a newer "updatedAt": a row without a login code
    // ranks last, and a newsletter code never ranks a row.
    expect(idByEmail.get('login@example.fr')).toBe(LOGIN_CODE_ID)
    expect(idByEmail.has('recent@example.fr')).toBe(false)

    // A row whose id is not duplicated is left as it was.
    expect(idByEmail.get('solo@example.fr')).toBe(UNTOUCHED_ID)

    // A second run finds nothing to do.
    await deduplicateVerifiedUsers({ client, dry: false })
    expect(await verifiedUsersOf()).toEqual(verifiedUsers)
    expect(
      (
        await pg.query<{ count: number }>(
          `SELECT COUNT(*)::int AS count FROM ngc."User"`
        )
      ).rows
    ).toEqual([{ count: 9 }])
  })

  it('moves the administrator row to the surviving email and keeps its id, organisation and creation date', async () => {
    const before = await organisationAdministratorsOf()

    await deduplicateVerifiedUsers({ client, dry: false })

    const after = await organisationAdministratorsOf()

    // The moved rows are updated rather than deleted and written again.
    expect(
      after.map(({ id, organisationId, createdAt }) => ({
        id,
        organisationId,
        createdAt,
      }))
    ).toEqual(
      before.map(({ id, organisationId, createdAt }) => ({
        id,
        organisationId,
        createdAt,
      }))
    )

    expect(after.map(({ id, userEmail }) => [id, userEmail])).toEqual([
      ['admin-1', 'admin1@example.fr'],
      ['admin-2', 'admin2@example.fr'],
      ['admin-a3', 'surv3@example.fr'],
      ['admin-b3', 'b3@example.fr'],
      ['admin-old', 'new@example.fr'],
    ])
  })

  it('copies the account row of a redundant administrator kept under a fresh id', async () => {
    await deduplicateVerifiedUsers({ client, dry: false })

    const source = await userById(TWO_ADMINS_ID)
    const copy = await userByEmail('admin1@example.fr')

    expect(copy).toEqual({
      ...source,
      id: copy?.id,
      email: 'admin1@example.fr',
    })
  })

  it('mirrors the surviving email into "User"."email" and leaves a NULL value NULL', async () => {
    await deduplicateVerifiedUsers({ client, dry: false })

    expect((await userById(TWICE_SIGNED_UP_ID))?.email).toBe('dup1@example.fr')
    expect((await userById(FRESH_EMAIL_ID))?.email).toBeNull()
  })

  it('applies the plan in one transaction with the long timeout and rolls it back when a statement fails', async () => {
    const verifiedUsersBefore = await verifiedUsersOf()
    const administratorsBefore = await organisationAdministratorsOf()
    const usersBefore = await usersOf()

    const transactionOptions: ({ timeout?: number } | undefined)[] = []

    const failingClient: VerifiedUserDeduplicationClient = {
      $queryRawUnsafe: client.$queryRawUnsafe,
      $executeRawUnsafe: client.$executeRawUnsafe,
      $transaction: (run, options) => {
        transactionOptions.push(options)

        return client.$transaction(
          (transactionClient) =>
            run({
              ...transactionClient,
              $executeRawUnsafe: (query: string) =>
                query.includes('UPDATE "ngc"."User" "account"')
                  ? Promise.reject(new Error('simulated statement failure'))
                  : transactionClient.$executeRawUnsafe(query),
            }),
          options
        )
      },
    }

    await expect(
      deduplicateVerifiedUsers({ client: failingClient, dry: false })
    ).rejects.toThrow('simulated statement failure')

    // The statements read the whole "VerifiedUser" table: the default timeout
    // is short.
    expect(transactionOptions).toEqual([{ timeout: 10 * 60 * 1000 }])

    // The failure came after the moves and the deletions: the rollback undid
    // all of them.
    expect(await verifiedUsersOf()).toEqual(verifiedUsersBefore)
    expect(await organisationAdministratorsOf()).toEqual(administratorsBefore)
    expect(await usersOf()).toEqual(usersBefore)

    // No temporary table outlives the rolled back transaction.
    await deduplicateVerifiedUsers({ client, dry: false })
    expect(await verifiedUsersOf()).toHaveLength(9)
  })
})

describe('readDryFlag', () => {
  it('runs dry by default, on --dry and on -d', () => {
    expect(readDryFlag([])).toBe(true)
    expect(readDryFlag(['--dry'])).toBe(true)
    expect(readDryFlag(['-d'])).toBe(true)
  })

  it('applies the plan on --no-dry and on --no-d', () => {
    expect(readDryFlag(['--no-dry'])).toBe(false)
    expect(readDryFlag(['--no-d'])).toBe(false)
  })

  it('rejects an option the command line does not accept', () => {
    expect(() => readDryFlag(['--apply'])).toThrow()
  })
})

describe('exitCodeOfRun', () => {
  const remainingAnomalies = { ...NO_ANOMALY, redundantVerifiedUserRows: 1 }

  it('exits with 0 on a dry run even when anomalies remain', () => {
    expect(exitCodeOfRun({ dry: true, remainingAnomalies })).toBe(0)
  })

  it('exits with 0 when an applied run leaves no anomaly', () => {
    expect(exitCodeOfRun({ dry: false, remainingAnomalies: NO_ANOMALY })).toBe(
      0
    )
  })

  it('exits with 1 when an applied run leaves an anomaly', () => {
    expect(exitCodeOfRun({ dry: false, remainingAnomalies })).toBe(1)
  })
})

/**
 * The script talks to the client through raw statements: this exposes PGlite
 * the same way, with the transaction the plan and the writes are wrapped in.
 */
const clientOf = (pg: PGlite): VerifiedUserDeduplicationClient => {
  const client: VerifiedUserDeduplicationClient = {
    $queryRawUnsafe: async <T>(query: string): Promise<T> =>
      (await pg.query(query)).rows as T,
    $executeRawUnsafe: (query: string) => pg.exec(query),
    $transaction: async (transaction) => {
      await pg.exec('BEGIN')
      try {
        const result = await transaction({
          $queryRawUnsafe: client.$queryRawUnsafe,
          $executeRawUnsafe: client.$executeRawUnsafe,
        })
        await pg.exec('COMMIT')
        return result
      } catch (error) {
        await pg.exec('ROLLBACK')
        throw error
      }
    },
  }

  return client
}

const require = createRequire(import.meta.url)
const coreMain = require.resolve('@nosgestesclimat/core')
const MIGRATIONS_DIR = path.join(
  path.dirname(coreMain),
  '..',
  'prisma',
  'migrations'
)

const readMigration = async (name: string): Promise<string> => {
  const sql = await readFile(
    path.join(MIGRATIONS_DIR, name, 'migration.sql'),
    'utf8'
  )

  // PGlite holds a single connection and cannot build an index concurrently.
  return sql.replaceAll('CREATE INDEX CONCURRENTLY', 'CREATE INDEX')
}
