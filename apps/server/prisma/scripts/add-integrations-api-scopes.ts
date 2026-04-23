import type { PrismaClient } from '@nosgestesclimat/core/prisma/generated/client.js'
import { ApiScopeName } from '@nosgestesclimat/core/prisma/generated/client.js'

type Scope = {
  name: ApiScopeName
  description: string
}

export const exec = async ({ prisma }: { prisma: PrismaClient }) => {
  try {
    const scopes: Scope[] = [
      {
        name: ApiScopeName.ngc,
        description: 'Le scope pour les utilisateurs Nos Gestes Climat',
      },
      {
        name: ApiScopeName.two_tons,
        description: 'Le scope pour les utilisateurs 2 Tonnes',
      },
    ]

    await scopes.reduce(async (prom, { description, name }) => {
      await prom
      await prisma.integrationApiScope.upsert({
        where: {
          name,
        },
        create: {
          name,
          description,
        },
        update: {
          description,
        },
        select: {
          name: true,
        },
      })
    }, Promise.resolve())
    console.info(`${scopes.length} scopes added`)

    const { count } = await prisma.integrationApiScope.deleteMany({
      where: {
        name: {
          not: {
            in: scopes.map(({ name }) => name),
          },
        },
      },
    })
    console.info(`${count} scope(s) removed`)
  } catch (err) {
    console.error('Add scope error', err)
    throw err
  }
}
