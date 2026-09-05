import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { Group } from '../types/group.ts'

class GroupFactory extends Factory<Group, never, Group> {
  withAdministrator(userId: string) {
    return this.afterCreate(async (data) => {
      await prisma.groupAdministrator.create({
        data: { groupId: data.id, userId },
      })
      return { ...data, administratorId: userId }
    })
  }
}

export const groupFactory = GroupFactory.define(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.group.create({
      data: {
        id: data.id,
        name: data.name,
        emoji: data.emoji,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    })
    return data
  })

  return {
    id: faker.string.uuid(),
    name: faker.company.buzzPhrase(),
    // prettier-ignore
    emoji: faker.helpers.arrayElement(['🌍','🌱','🌳','🌊','☀️','🔥','♻️','🍃','🌿','🌸','🐱','🐶','🦊','🐼','🦋','🐝','🦉','🐢','🐬','🦋','🍎','🍇','🥕','🌽','🍞','🧀','🍫','☕','🍷','💧','🚲','🚗','✈️','🚆','🏠','🏢','🏭','💡','🔋','♻️',]),
    administratorId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
})
