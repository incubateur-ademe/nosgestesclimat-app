import type { PrismaClient } from '../generated/prisma/client.js'

const VALID_ROLE = /^[a-zA-Z_][a-zA-Z0-9_-]*$/

const assertValidRole = (role: string) => {
  if (!VALID_ROLE.test(role)) throw new Error(`Invalid role name: "${role}"`)
}

const grantReadonlyAccess = async (
  prisma: PrismaClient,
  roles: string[],
  schema: string
) => {
  const [{ exists }] = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.schemata WHERE schema_name = ${schema}
    ) as "exists"
  `

  if (!exists) {
    console.warn(`Schema "${schema}" does not exist, skipping grants`)
    return
  }

  for (const rawRole of roles) {
    const role = rawRole.trim()
    assertValidRole(role)

    await prisma.$transaction([
      prisma.$queryRawUnsafe(`GRANT USAGE ON SCHEMA "${schema}" TO "${role}"`),
      prisma.$queryRawUnsafe(
        `GRANT SELECT ON ALL TABLES IN SCHEMA "${schema}" TO "${role}"`
      ),
    ])
  }
}

export const exec = async ({ prisma }: { prisma: PrismaClient }) => {
  const readonlyRoles = process.env.DATABASE_READONLY_ROLES?.split(',') ?? []
  const anonRoles = process.env.DATABASE_READONLY_ANON_ROLES?.split(',') ?? []

  if (readonlyRoles.length) {
    await grantReadonlyAccess(prisma, readonlyRoles, 'ngc')
    console.info(`${readonlyRoles.length} readonly role(s) granted on ngc`)
  } else {
    console.info('No readonly role to grant')
  }

  if (anonRoles.length) {
    await grantReadonlyAccess(prisma, anonRoles, 'ngc_anon')
    console.info(
      `${anonRoles.length} anon readonly  role(s) granted on ngc_anon`
    )
  } else {
    console.info('No readonly anon role to grant')
  }
}
