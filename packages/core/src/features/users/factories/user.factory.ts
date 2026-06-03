import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'

interface UserFixture {
  id: string
}

export const userFactory = Factory.define<UserFixture>(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.user.create({ data: { id: data.id } })
    return data
  })

  return { id: faker.string.uuid() }
})
