import type { PrismaClient } from '../generated/prisma/client.js'
import { ApiScopeName } from '../generated/prisma/client.js'

const parsePatterns = ({
  description,
  rawPatterns,
  apiScopeName,
}: {
  rawPatterns?: string
  apiScopeName: ApiScopeName
  description: string
}) =>
  rawPatterns?.split(',').map((emailPattern) => ({
    description,
    emailPattern,
    apiScopeName,
  })) || []

export const exec = async ({ prisma }: { prisma: PrismaClient }) => {
  try {
    const whitelistPatterns = [
      ...parsePatterns({
        description: 'La whitelist email des utilisateurs Nos Gestes Climat',
        apiScopeName: ApiScopeName.ngc,
        rawPatterns: process.env.DATABASE_INTEGRATIONS_EMAIL_NGC_WHITELIST,
      }),
      ...parsePatterns({
        description: 'La whitelist email des utilisateurs 2 Tonnes',
        apiScopeName: ApiScopeName.two_tons,
        rawPatterns: process.env.DATABASE_INTEGRATIONS_EMAIL_2T_WHITELIST,
      }),
    ]

    await whitelistPatterns.reduce(
      async (prom, { description, apiScopeName, emailPattern }) => {
        await prom
        await prisma.integrationWhitelist.upsert({
          where: {
            emailPattern_apiScopeName: {
              apiScopeName,
              emailPattern,
            },
          },
          create: {
            emailPattern,
            description,
            apiScope: {
              connect: {
                name: apiScopeName,
              },
            },
          },
          update: {
            description,
          },
          select: {
            id: true,
          },
        })
      },
      Promise.resolve()
    )
    console.info(`${whitelistPatterns.length} whitelist pattern(s) added`)
  } catch (err) {
    console.error('Add whitelist patterns error', err)
    throw err
  }
}
