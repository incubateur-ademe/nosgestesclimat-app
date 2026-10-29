import { actionAssessmentFactory } from '@nosgestesclimat/core/features/actions/factories/action-assessment.factory'
import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import { userFactory } from '@nosgestesclimat/core/features/users/factories/user.factory'
import type { UnverifiedUser } from '@nosgestesclimat/core/features/users/types/user'
import {
  CATALOGUE_ACTIONS,
  PUBLIC_HIGHLIGHTED_ACTIONS,
  type CatalogueActionKey,
} from '../helpers/actions'
import { signIn } from '../helpers/session'
import { test as base, expect } from '../local/actions'
import { ActionsCatalogue } from '../page-objects/actions-catalogue'

/**
 * How the visitor's simulation is assessed, as the site worker would have:
 * applicable or not (undefined: unknown), with an impact in kg when it is
 * quantifiable.
 */
const ASSESSMENTS: Record<
  CatalogueActionKey,
  { applicable?: boolean; impact?: number }
> = {
  reduireViande: { applicable: true, impact: 655 },
  ecoconduite: { applicable: true, impact: 245 },
  faireDurerSesObjets: { applicable: true, impact: 116 },
  reduireBoissonsSucrees: { applicable: true, impact: 36 },
  valoriserDechets: { applicable: true, impact: 11 },
  vacancesEnTrain: { applicable: true },
  achatReconditionne: { applicable: true },
  engagementAssociatif: { applicable: true },
  eviterDeperditionsChaleur: { applicable: true },
  consommationHeuresCreuses: { applicable: true },
  limiterAvion: {},
  petitsTrajetsSansVoiture: {},
  locationVoiture: { applicable: false },
  reduireViandeRouge: { applicable: false },
}

/**
 * The visitor is a user without a verified account (no email) owning a
 * completed simulation, whose computation is completed and whose actions are
 * assessed (ASSESSMENTS). Everything is seeded in the e2e database: the
 * simulation is not run through the UI, and the site worker has nothing left
 * to compute. The visitor is signed in with an anonymous session (no email),
 * as the site issues to anyone taking the test.
 */
const test = base.extend<{ visitor: UnverifiedUser }>({
  visitor: [
    async ({ context, catalogue }, use) => {
      const user = await userFactory.unverified().create()
      const simulation = await simulationFactory
        .completed()
        .params({ userId: user.id })
        .withValidComputedResults()
        .withCompletedComputation()
        .create()

      await Promise.all(
        Object.entries(ASSESSMENTS).map(([key, { applicable, impact }]) => {
          const factory =
            applicable === true
              ? actionAssessmentFactory.applicable({ impact })
              : applicable === false
                ? actionAssessmentFactory.inapplicable()
                : actionAssessmentFactory.unknownApplicability()

          return factory.create({
            simulationId: simulation.id,
            actionId: catalogue[key as CatalogueActionKey].id,
          })
        })
      )

      await signIn(context, user)
      await use(user)
    },
    { auto: true },
  ],
})

/** A formatted footprint, whatever its value: « -0,7 tonne CO2e / an », « -0,1 t CO2e / an »… */
const FOOTPRINT_VALUE = /\d+(,\d+)? (t|tonnes?|kg) CO2e \/ an/

test.describe('Public actions catalogue', () => {
  test('a visitor who completed the test browses the public catalogue, opens an action personalized to its simulation, then goes back', async ({
    page,
    actionsCatalogue,
    actionDetail,
  }) => {
    const viande = CATALOGUE_ACTIONS.reduireViande

    await test.step('I visit the public actions catalogue', async () => {
      await page.goto(ActionsCatalogue.PUBLIC_URL)

      await expect(actionsCatalogue.publicTitle()).toBeVisible()

      // The visitor is recognized: its results and a retake are offered.
      const callToAction = page.getByRole('complementary')
      await expect(callToAction.getByTestId('main-cta')).toHaveText(
        'Voir mes résultats'
      )
      await expect(callToAction.getByTestId('main-cta')).toHaveAttribute(
        'href',
        '/fin'
      )
      await expect(callToAction.getByTestId('restart-link')).toBeVisible()

      // The catalogue itself is the same for everyone: curated highlights
      // (whatever their applicability to the visitor), every action listed
      // by theme, without impact nor commitment.
      await expect(
        actionsCatalogue.highlightedCards().getByRole('heading')
      ).toHaveText(
        PUBLIC_HIGHLIGHTED_ACTIONS.map((key) => CATALOGUE_ACTIONS[key].title)
      )
      for (const { title, theme } of Object.values(CATALOGUE_ACTIONS)) {
        await expect(
          actionsCatalogue.themeCard(theme.title, title)
        ).toBeAttached()
      }
      await expect(page.getByText('Impact potentiel')).toHaveCount(0)
      await expect(actionsCatalogue.addButton(page)).toHaveCount(0)
    })

    await test.step('I open an action: its detail page is personalized to my simulation', async () => {
      await actionsCatalogue
        .actionLink(
          actionsCatalogue.highlightedCard(viande.title),
          viande.title
        )
        .click()

      await expect(page).toHaveURL(
        `/actions/${viande.theme.slug}/${viande.slug}?from=index`
      )
      await expect(actionDetail.title()).toHaveText(viande.title)
      await expect(actionDetail.header()).toContainText(viande.theme.title)
      await expect(actionDetail.understandSection()).toBeVisible()

      // Applicable, with a numeric impact: the impact block and the
      // commitment banner are shown.
      await expect(actionDetail.header()).toContainText(
        'Réduction max sur votre empreinte'
      )
      await expect(actionDetail.header()).toContainText(FOOTPRINT_VALUE)
      await expect(actionDetail.commitmentButton()).toBeVisible()

      // The other applicable actions of the theme, most impactful first,
      // each with its impact and a commit button. The one that does not
      // apply (reduireViandeRouge) is left out.
      const otherActions = [
        CATALOGUE_ACTIONS.reduireBoissonsSucrees,
        CATALOGUE_ACTIONS.valoriserDechets,
      ]
      await expect(
        actionDetail.otherThemeActionCards().getByRole('heading')
      ).toHaveText(otherActions.map(({ title }) => title))
      for (const { title } of otherActions) {
        const card = actionDetail.otherThemeActionCard(title)
        await expect(card).toContainText(FOOTPRINT_VALUE)
        await expect(actionsCatalogue.addButton(card)).toBeVisible()
      }
    })

    await test.step('I go back to the public catalogue', async () => {
      await actionDetail.goBackLink().click()

      await expect(page).toHaveURL(ActionsCatalogue.PUBLIC_URL)
      await expect(actionsCatalogue.publicTitle()).toBeVisible()
      await expect(actionsCatalogue.highlightedCard(viande.title)).toBeVisible()
    })
  })
})
