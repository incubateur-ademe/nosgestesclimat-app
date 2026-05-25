import { actionFactory } from '../src/features/actions/factories/index.ts'
import { prisma } from '../src/prisma/client.ts'

const seed = async () => {
  await actionFactory.published().createList(15)
  await actionFactory.draft().createList(5)
  await actionFactory.scheduled().createList(5)
  await actionFactory.published().pendingDeletion().createList(5)

  await Promise.all(
    Array.from({ length: 5 }, () =>
      actionFactory.published().deleted().create()
    )
  )
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
