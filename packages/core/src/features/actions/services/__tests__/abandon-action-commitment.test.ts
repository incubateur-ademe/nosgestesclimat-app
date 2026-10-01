import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { actionChoiceFactory } from '../../factories/action-choice.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { abandonActionCommitment } from '../abandon-action-commitment.service.ts'
import { getPersonalizedActionDetails } from '../get-personalized-action-details.service.ts'

describe('abandonActionCommitment', () => {
  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  it('should delete an existing action choice', async () => {
    const action = await actionFactory.published().create()
    const user = await userFactory.create()
    const actionId = action.id
    const userId = user.id
    await actionChoiceFactory.create({
      actionId: actionId,
      userId: userId,
    })

    const { action: actionAfterCommitment } =
      (await getPersonalizedActionDetails(action.slug, 'fr', userId)) ?? {}

    expect(actionAfterCommitment).toBeDefined()
    expect(actionAfterCommitment?.choice).toBeDefined()

    await abandonActionCommitment({
      actionId,
      userId,
    })

    const { action: actionAfterAbandonment } =
      (await getPersonalizedActionDetails(action.slug, 'fr', userId)) ?? {}

    expect(actionAfterAbandonment).toBeDefined()
    expect(actionAfterAbandonment?.choice).toEqual(null)
  })
})
