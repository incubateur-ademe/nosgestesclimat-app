import { faker } from '@faker-js/faker'
import { actionFactory } from '../src/features/actions/factories/index.ts'
import { prisma } from '../src/prisma/client.ts'

const seed = async () => {
  await actionFactory.createList(15)

  await actionFactory.params({ publishedAt: null }).createList(5)

  await Promise.all(
    Array.from({ length: 5 }, () =>
      actionFactory
        .params({
          publishedAt: faker.date.past(),
          deletedAt: faker.date.recent(),
        })
        .create()
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
