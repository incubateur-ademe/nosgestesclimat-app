import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import type { ISOSupportedLanguage } from '../../../geo/types/language.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { food, housing, transport } from '../../data/themes/index.ts'
import { actionAssessmentFactory } from '../../factories/action-assessment.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import type { Action, ActionAssessment } from '../../types/action.ts'
import type { ThemeRow } from '../../types/theme.ts'
import { getActionsPlan } from '../get-actions-plan.service.ts'

describe('getActionsPlan', () => {
  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  it('returns an empty plan when the user has no committed action', async () => {
    const action = await actionFactory.published().create()
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withStatus('full_result_seen')
      .params({ userId: user.id })
      .withCompletedComputation()
      .create()
    await actionAssessmentFactory
      .params({ simulationId: simulation.id, actionId: action.id })
      .applicable({ impact: 1000 })
      .create()

    const result = await getActionsPlan(user.id, 'fr')

    expect(result).toEqual({
      plan: { numberOfCommittedActions: 0, totalImpact: 0 },
      themes: [],
    })
  })

  it('returns an empty plan after the user abandonned their only committed action', async () => {
    const action = await actionFactory.published().deleted().create()
    const user = await userFactory.create()
    await simulationFactory
      .withStatus('full_result_seen')
      .params({ userId: user.id })
      .create()
    await actionFactory.chosen({ actionId: action.id, userId: user.id })

    const result = await getActionsPlan(user.id, 'fr')

    expect(result).toEqual({
      plan: { numberOfCommittedActions: 0, totalImpact: 0 },
      themes: [],
    })
  })

  it('returns null when the user has no finished simulation', async () => {
    const action = await actionFactory.published().create()
    const user = await userFactory.create()
    await actionFactory.chosen({ actionId: action.id, userId: user.id })

    const result = await getActionsPlan(user.id, 'fr')

    expect(result).toBeNull()
  })

  it('excludes rejected actions from the plan', async () => {
    const [committedAction, rejectedAction] = await Promise.all([
      actionFactory
        .published()
        .params({ theme: toActionTheme(food) })
        .create(),
      actionFactory
        .published()
        .params({ theme: toActionTheme(food) })
        .create(),
    ])
    const user = await userFactory.create()
    await simulationFactory
      .withStatus('full_result_seen')
      .params({ userId: user.id })
      .create()
    await actionFactory.chosen({
      actionId: committedAction.id,
      userId: user.id,
    })
    await prisma.actionChoice.create({
      data: {
        id: faker.string.uuid(),
        userId: user.id,
        actionId: rejectedAction.id,
        type: 'rejected',
        chosenAt: new Date(),
      },
    })

    const result = await getActionsPlan(user.id, 'fr')

    expect(result).toEqual({
      plan: { numberOfCommittedActions: 1, totalImpact: 0 },
      themes: [
        {
          ...toExpectedTheme(food, 'fr'),
          actions: [toExpectedCommittedAction(committedAction, null)],
        },
      ],
    })
  })

  it('returns the plan summary and the committed actions grouped by theme, in theme order', async () => {
    const [foodAction, housingAction] = await Promise.all([
      actionFactory
        .published()
        .params({ theme: toActionTheme(food) })
        .create(),
      actionFactory
        .published()
        .params({ theme: toActionTheme(housing) })
        .create(),
      // A visible action of a theme the user did not commit to
      actionFactory
        .published()
        .params({ theme: toActionTheme(transport) })
        .create(),
    ])
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withStatus('full_result_seen')
      .params({ userId: user.id })
      .withCompletedComputation()
      .create()
    const [foodAssessment, housingAssessment] = await Promise.all([
      actionAssessmentFactory
        .params({ simulationId: simulation.id, actionId: foodAction.id })
        .applicable({ impact: 500 })
        .create(),
      actionAssessmentFactory
        .params({ simulationId: simulation.id, actionId: housingAction.id })
        .applicable({ impact: 1000 })
        .create(),
    ])
    await Promise.all([
      actionFactory.chosen({ actionId: foodAction.id, userId: user.id }),
      actionFactory.chosen({ actionId: housingAction.id, userId: user.id }),
    ])

    const result = await getActionsPlan(user.id, 'fr')

    // Housing comes before food in the theme order, transport has no
    // committed action and is left out
    expect(result).toEqual({
      plan: { numberOfCommittedActions: 2, totalImpact: 1500 },
      themes: [
        {
          ...toExpectedTheme(housing, 'fr'),
          actions: [
            toExpectedCommittedAction(housingAction, housingAssessment),
          ],
        },
        {
          ...toExpectedTheme(food, 'fr'),
          actions: [toExpectedCommittedAction(foodAction, foodAssessment)],
        },
      ],
    })
  })

  it('orders the actions of a theme by descending impact when the computation is completed', async () => {
    const [low, high] = await Promise.all([
      actionFactory
        .published()
        .params({ theme: toActionTheme(food) })
        .create(),
      actionFactory
        .published()
        .params({ theme: toActionTheme(food) })
        .create(),
    ])
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withStatus('full_result_seen')
      .params({ userId: user.id })
      .withCompletedComputation()
      .create()
    const [lowAssessment, highAssessment] = await Promise.all([
      actionAssessmentFactory
        .params({ simulationId: simulation.id, actionId: low.id })
        .applicable({ impact: 200 })
        .create(),
      actionAssessmentFactory
        .params({ simulationId: simulation.id, actionId: high.id })
        .applicable({ impact: 1000 })
        .create(),
    ])
    await Promise.all([
      actionFactory.chosen({ actionId: low.id, userId: user.id }),
      actionFactory.chosen({ actionId: high.id, userId: user.id }),
    ])

    const result = await getActionsPlan(user.id, 'fr')

    expect(result).toEqual({
      plan: { numberOfCommittedActions: 2, totalImpact: 1200 },
      themes: [
        {
          ...toExpectedTheme(food, 'fr'),
          actions: [
            toExpectedCommittedAction(high, highAssessment),
            toExpectedCommittedAction(low, lowAssessment),
          ],
        },
      ],
    })
  })

  it('includes committed actions assessed as inapplicable, e.g. when user has applied the actions advices and taken another simulation', async () => {
    const [applicableAction, inapplicableAction] = await Promise.all([
      actionFactory
        .published()
        .params({ theme: toActionTheme(food) })
        .create(),
      actionFactory
        .published()
        .params({ theme: toActionTheme(housing) })
        .create(),
    ])
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withStatus('full_result_seen')
      .params({ userId: user.id })
      .withCompletedComputation()
      .create()
    const [applicableAssessment, inapplicableAssessment] = await Promise.all([
      actionAssessmentFactory
        .params({ simulationId: simulation.id, actionId: applicableAction.id })
        .applicable({ impact: 1000 })
        .create(),
      actionAssessmentFactory
        .params({
          simulationId: simulation.id,
          actionId: inapplicableAction.id,
        })
        .inapplicable()
        .create(),
    ])
    await Promise.all([
      actionFactory.chosen({ actionId: applicableAction.id, userId: user.id }),
      actionFactory.chosen({
        actionId: inapplicableAction.id,
        userId: user.id,
      }),
    ])

    const result = await getActionsPlan(user.id, 'fr')

    // The inapplicable action counts in the number of committed actions but
    // has no impact
    expect(result).toEqual({
      plan: { numberOfCommittedActions: 2, totalImpact: 1000 },
      themes: [
        {
          ...toExpectedTheme(housing, 'fr'),
          actions: [
            toExpectedCommittedAction(
              inapplicableAction,
              inapplicableAssessment
            ),
          ],
        },
        {
          ...toExpectedTheme(food, 'fr'),
          actions: [
            toExpectedCommittedAction(applicableAction, applicableAssessment),
          ],
        },
      ],
    })
  })

  it('includes committed actions without assessment and counts a null impact as zero', async () => {
    const action = await actionFactory
      .published()
      .params({ theme: toActionTheme(food) })
      .create()
    const user = await userFactory.create()
    // Finished simulation whose model was never computed: choices are read,
    // assessments are not
    await simulationFactory
      .withStatus('full_result_seen')
      .params({ userId: user.id })
      .create()
    await actionFactory.chosen({ actionId: action.id, userId: user.id })

    const result = await getActionsPlan(user.id, 'fr')

    expect(result).toEqual({
      plan: { numberOfCommittedActions: 1, totalImpact: 0 },
      themes: [
        {
          ...toExpectedTheme(food, 'fr'),
          actions: [toExpectedCommittedAction(action, null)],
        },
      ],
    })
  })

  describe('when locale is "en"', () => {
    it('localizes the theme titles', async () => {
      const action = await actionFactory
        .published()
        .params({ theme: toActionTheme(food) })
        .create()
      const user = await userFactory.create()
      await simulationFactory
        .withStatus('full_result_seen')
        .params({ userId: user.id })
        .create()
      await actionFactory.chosen({ actionId: action.id, userId: user.id })

      const result = await getActionsPlan(user.id, 'en')

      expect(result).toEqual({
        plan: { numberOfCommittedActions: 1, totalImpact: 0 },
        themes: [
          {
            ...toExpectedTheme(food, 'en'),
            actions: [toExpectedCommittedAction(action, null)],
          },
        ],
      })
    })

    it('falls back to French content for actions with no English translation', async () => {
      const action = await actionFactory
        .published()
        .params({ theme: toActionTheme(food) })
        .create()
      const user = await userFactory.create()
      await simulationFactory
        .withStatus('full_result_seen')
        .params({ userId: user.id })
        .create()
      await actionFactory.chosen({ actionId: action.id, userId: user.id })

      const result = await getActionsPlan(user.id, 'en')

      expect(result).toEqual({
        plan: { numberOfCommittedActions: 1, totalImpact: 0 },
        themes: [
          {
            ...toExpectedTheme(food, 'en'),
            actions: [toExpectedCommittedAction(action, null)],
          },
        ],
      })
    })
  })
})

/** The action factory theme attribute, without the locale-specific columns */
const toActionTheme = ({
  titleEn: _titleEn,
  slugEn: _slugEn,
  ...theme
}: ThemeRow) => theme

/** The theme as returned in the plan, localized */
const toExpectedTheme = (
  { titleEn, slugEn, ...theme }: ThemeRow,
  locale: ISOSupportedLanguage
) => ({
  ...theme,
  title: locale === 'en' ? titleEn : theme.title,
  slug: locale === 'en' ? slugEn : theme.slug,
  locale,
})

/**
 * The committed action as returned in the plan. The `chosenAt` date is
 * created inside the factory and cannot be asserted exactly.
 */
const toExpectedCommittedAction = (
  action: Action,
  assessment: ActionAssessment | null
) => ({
  ...action,
  assessment,
  choice: expect.objectContaining({ type: 'committed' }),
})
