import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import {
  isPrismaErrorForeignKeyConstraintFailed,
  isPrismaErrorUniqueConstraintFailed,
} from '../../../../prisma/utils.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { actionChoiceFactory } from '../../factories/action-choice.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'

describe('commitToAction()', () => {
  afterEach(async () => {
    await prisma.actionChoice.deleteMany()
    await prisma.action.deleteMany()
    await prisma.user.deleteMany()
  })

  it('creates a new action choice for a given user', async () => {
    const action = await actionFactory.published().create()

    const user = await userFactory.create()

    const actionChoice = await actionChoiceFactory
      .params({
        actionId: action.id,
        userId: user.id,
        type: 'committed',
      })
      .create()

    expect(actionChoice).toEqual(
      expect.objectContaining({
        actionId: action.id,
        userId: user.id,
        type: 'committed',
      })
    )
  })

  it('throws when an invalid userId is pass as an argument', async () => {
    const action = await actionFactory.published().create()

    await userFactory.create()

    await expect(
      actionChoiceFactory
        .params({
          actionId: action.id,
          userId: faker.string.uuid(),
          type: 'committed',
        })
        .create()
    ).rejects.toThrow(/Foreign key constraint violated/)
  })

  it('throws when an invalid actionId is pass as an argument', async () => {
    await actionFactory.published().create()

    const user = await userFactory.create()

    let error
    try {
      await actionChoiceFactory
        .params({
          actionId: faker.string.uuid(),
          userId: user.id,
          type: 'committed',
        })
        .create()
    } catch (err) {
      error = err
    } finally {
      expect(isPrismaErrorForeignKeyConstraintFailed(error)).toBe(true)
    }
  })

  it('throws when an action choice is already created for a user', async () => {
    const action = await actionFactory.published().create()

    const user = await userFactory.create()

    const createActionChoiceFactory = actionChoiceFactory.params({
      actionId: action.id,
      userId: user.id,
      type: 'committed',
    })

    const actionChoice = await createActionChoiceFactory.create()

    expect(actionChoice).toEqual(
      expect.objectContaining({
        actionId: action.id,
        userId: user.id,
        type: 'committed',
      })
    )

    let error
    try {
      await createActionChoiceFactory.create()
    } catch (err) {
      error = err
    } finally {
      expect(isPrismaErrorUniqueConstraintFailed(error)).toBe(true)
    }
  })
})
