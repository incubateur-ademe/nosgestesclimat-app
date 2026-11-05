import {
  CATALOGUE_ACTIONS,
  PUBLIC_HIGHLIGHTED_ACTIONS,
} from '../helpers/actions'
import { expect, test } from '../local/actions'
import { ActionDetail } from '../page-objects/action-detail'
import { ActionsCatalogue } from '../page-objects/actions-catalogue'

/** A formatted footprint, whatever its value: « -0,7 tonne CO2e / an », « -0,1 t CO2e / an »… */
const FOOTPRINT_VALUE = /\d+(,\d+)? (t|tonnes?|kg) CO2e \/ an/

test.describe('Public actions catalogue', () => {
  // The visitor owns a completed simulation, assessed by the seed
  test.beforeEach(async ({ signInAssessedUser }) => {
    await signInAssessedUser()
  })

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

      await expect(page).toHaveURL(ActionDetail.url(viande, 'index'))
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
