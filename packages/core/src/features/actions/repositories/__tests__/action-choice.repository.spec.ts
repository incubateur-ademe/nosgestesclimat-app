import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { actionChoiceFactory } from '../../factories/action-choice.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import {
  createActionChoice,
  deleteActionChoice,
} from '../action-choice.repository.ts'

describe('createActionChoice()', () => {
  afterEach(async () => {
    await prisma.actionChoice.deleteMany()
    await prisma.action.deleteMany()
    await prisma.user.deleteMany()
  })

  it('should throw when an invalid action id is passed as a parameter', async () => {
    const user = await userFactory.create()

    await expect(
      createActionChoice({
        userId: user.id,
        actionId: faker.string.uuid(),
      })
    ).rejects.toThrow()
  })

  it('should throw when an invalid user id is passed as a parameter', async () => {
    const action = await actionFactory.published().create()

    await expect(
      createActionChoice({
        userId: faker.string.uuid(),
        actionId: action.id,
      })
    ).rejects.toThrow()
  })

  it('should not throw when an action choice creation is initiated whereas said action choice was already created', async () => {
    const action = await actionFactory.published().create()
    const user = await userFactory.create()

    // First attempt => success
    await createActionChoice({
      userId: user.id,
      actionId: action.id,
    })

    // Second attempt => success, the error is ignored in the repository
    await expect(
      createActionChoice({
        userId: user.id,
        actionId: action.id,
      })
    ).resolves.toBeUndefined()
  })
})

describe('deleteActionChoice', () => {
  afterEach(async () => {
    await prisma.actionChoice.deleteMany()
    await prisma.action.deleteMany()
    await prisma.user.deleteMany()
  })

  it('should throw when an invalid user id is passed as a parameter', async () => {
    const action = await actionFactory.published().create()
    const actionChoice = await actionChoiceFactory.create({
      actionId: action.id,
      userId: faker.string.uuid(),
    })

    await expect(
      deleteActionChoice({
        userId: faker.string.uuid(),
        actionChoiceId: actionChoice.id,
      })
    ).rejects.toThrow()
  })

  it('should throw when an invalid actionChoice id is passed as a parameter', async () => {
    const user = await userFactory.create()
    const action = await actionFactory.published().create()
    const actionChoice = await actionChoiceFactory.create({
      actionId: action.id,
      userId: user.id,
    })

    await expect(
      deleteActionChoice({
        userId: faker.string.uuid(),
        actionChoiceId: actionChoice.id,
      })
    ).rejects.toThrow()
  })

  it('should delete an action when valid arguments are passed', async () => {
    const user = await userFactory.create()
    const action = await actionFactory.published().create()
    const actionChoice = await actionChoiceFactory.create({
      actionId: action.id,
      userId: user.id,
    })

    await createActionChoice({
      userId: user.id,
      actionId: action.id,
    })

    await expect(
      deleteActionChoice({
        userId: user.id,
        actionChoiceId: actionChoice.id,
      })
    ).resolves.toBeUndefined()
  })
})
