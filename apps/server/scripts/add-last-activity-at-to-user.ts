import { prisma } from '@nosgestesclimat/core/prisma/client'
import { parseArgs } from 'node:util'

const DEFAULT_BATCH_SIZE = 1000

interface Props {
  dry: boolean | undefined
  batchSize?: number
}

interface BatchResult {
  candidates_count: bigint
  updated_count: bigint
  last_id: string | null
}

export async function addLastActivityAtToUser(props?: Props) {
  const { dry = true, batchSize = DEFAULT_BATCH_SIZE } = props ?? {}
  const isDry = dry ?? true

  console.log('Updating users by setting their lastActivityAt date')

  console.log(
    isDry
      ? 'Dry mode enabled: read-only mode'
      : 'Dry mode disabled: updating the DB'
  )

  let cursor: string | null = null
  let batchCount = 0
  let candidatesCount = 0n
  let updatedCount = 0n

  do {
    const batches: BatchResult[] = await prisma.$queryRawUnsafe<BatchResult[]>(
      /* sql */
      `
      WITH targeted_users AS (
        SELECT u.id FROM ngc."User" u
         WHERE u."lastActivityAt" IS NULL
            -- Arbitrary comparison in order to allow pagination to take place
           AND ($1::uuid IS NULL OR u.id > $1::uuid)
           AND EXISTS (
             SELECT 1 FROM ngc."VerifiedUser" v_u WHERE v_u.id = u.id
           )
         ORDER BY u.id
         LIMIT $2::int
      ),
      linked_entities AS (
        SELECT u.id AS user_id, u."updatedAt" AS dates
          FROM ngc."User" u
          JOIN targeted_users t_u ON t_u.id = u.id

        UNION ALL
        SELECT g_a."userId", g_a."updatedAt" AS dates
          FROM ngc."GroupAdministrator" g_a
          JOIN targeted_users t_u ON t_u.id = g_a."userId"

        UNION ALL
        SELECT g_p."userId", g_p."updatedAt" AS dates
          FROM ngc."GroupParticipant" g_p
          JOIN targeted_users t_u ON t_u.id = g_p."userId"

        UNION ALL
        SELECT s."userId", s."updatedAt" AS dates
          FROM ngc."Simulation" s
          JOIN targeted_users t_u ON t_u.id = s."userId"

        UNION ALL
        SELECT r_t."userId", r_t."createdAt" AS dates
          FROM ngc."RefreshToken" r_t
          JOIN targeted_users t_u ON t_u.id = r_t."userId"

        UNION ALL
        SELECT v_u.id, oa."updatedAt" AS dates
          FROM ngc."OrganisationAdministrator" oa
          JOIN ngc."VerifiedUser" v_u ON v_u.email = oa."userEmail"
          JOIN targeted_users t_u ON t_u.id = v_u.id

        UNION ALL
        SELECT v_u.id, v_c."updatedAt" AS dates
          FROM ngc."VerificationCode" v_c
          JOIN ngc."VerifiedUser" v_u ON v_u.email = v_c.email
          JOIN targeted_users t_u ON t_u.id = v_u.id
         -- Newsletter subscriptions do not issue a session
         WHERE v_c.usage = 'login'
      ),
      most_recent_user_update_selection AS (
        SELECT user_id, MAX(dates) AS date
          FROM linked_entities
         GROUP BY user_id
      ),
      updated_users AS (
        UPDATE ngc."User" u
           SET "lastActivityAt" = m_r.date
          FROM most_recent_user_update_selection m_r
         WHERE u.id = m_r.user_id
          -- Prevent update if dry mode is enabled
          AND NOT $3::boolean
        RETURNING u.id
     )
     SELECT
       (SELECT COUNT(*) FROM targeted_users)  AS candidates_count,
       (SELECT COUNT(*) FROM updated_users) AS updated_count,
       (SELECT id FROM targeted_users ORDER BY id DESC LIMIT 1) AS last_id
    `,
      cursor,
      batchSize,
      isDry
    )

    const batch: BatchResult | undefined = batches[0]

    if (!batch) {
      break
    }

    batchCount += 1
    candidatesCount += batch.candidates_count
    updatedCount += batch.updated_count

    console.log(
      `Batch ${batchCount}: ${batch.candidates_count} User(s) processed, ${batch.updated_count} updated`
    )

    cursor = batch.last_id
  } while (cursor !== null)

  console.log(
    `${candidatesCount} User(s) with no lastActivityAt, ${updatedCount} updated`
  )
}

const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`

if (isMain) {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      dry: { type: 'boolean' },
      d: { type: 'boolean' },
      'batch-size': { type: 'string' },
      b: { type: 'string' },
    },
    allowNegative: true,
  })

  const dry = values.dry ?? values.d ?? true
  const batchSize = Number(
    values['batch-size'] ?? values.b ?? DEFAULT_BATCH_SIZE
  )

  if (!Number.isInteger(batchSize) || batchSize < 1) {
    console.error('--batch-size must be a positive integer')
    process.exit(1)
  }

  addLastActivityAtToUser({ dry, batchSize })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
