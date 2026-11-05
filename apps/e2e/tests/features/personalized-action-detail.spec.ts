import { CATALOGUE_ACTIONS } from '../helpers/actions'
import { expect, test } from '../local/actions'
import { ActionDetail } from '../page-objects/action-detail'
import { ActionsCatalogue } from '../page-objects/actions-catalogue'

/**
 * The detail page of an action opened from the personalized catalogue, for a
 * visitor whose simulation is seeded and assessed (SEEDED_ASSESSMENTS). The
 * public catalogue's entry point is covered by
 * public-actions-catalogue-with-simulation, and the plan's by actions-plan-page.
 */
test.describe('Personalized action detail', () => {
  const action = CATALOGUE_ACTIONS.vacancesEnTrain
  const ecoconduite = CATALOGUE_ACTIONS.ecoconduite

  test.beforeEach(async ({ page, signInAssessedUser, actionDetail }) => {
    await signInAssessedUser()
    await page.goto(ActionDetail.url(action, 'mes-suggestions'))
    await expect(actionDetail.title()).toHaveText(action.title)
  })

  test('it shows an action applying to me, whose impact cannot be quantified', async ({
    actionsCatalogue,
    actionDetail,
    page,
  }) => {
    await expect(actionDetail.header()).toContainText(action.theme.title)

    // The « Je comprends l'enjeu » section is always there, its text varies
    await expect(actionDetail.understandSection()).toBeVisible()
    await expect(
      actionDetail.understandSection().getByRole('heading', { level: 3 })
    ).not.toBeEmpty()

    // No « Réduction max sur votre empreinte » block. As it applies to me, I
    // can still commit to it, and I haven't yet.
    await expect(actionDetail.header()).not.toContainText(
      'Réduction max sur votre empreinte'
    )
    await expect(actionDetail.commitmentButton()).toBeVisible()
    await expect(actionsCatalogue.addedButton(page)).toHaveCount(0)

    // « ← Retour » leads back to my personalized catalogue
    await expect(actionDetail.goBackLink()).toHaveAttribute(
      'href',
      ActionsCatalogue.PERSONALIZED_URL
    )
  })

  test('the other actions of its theme are personalized too', async ({
    actionsCatalogue,
    actionDetail,
  }) => {
    // The most impactful first, with its impact
    await expect(
      actionDetail.otherThemeActionCards().first().getByRole('heading')
    ).toHaveText(ecoconduite.title)
    const ecoconduiteCard = actionDetail.otherThemeActionCard(ecoconduite.title)
    await expect(ecoconduiteCard).toContainText(/Jusqu.à .+CO2e \/ an/)
    await expect(actionsCatalogue.addButton(ecoconduiteCard)).toBeVisible()

    // Without the one that doesn't apply to me
    await expect(
      actionDetail.otherThemeActionCard(CATALOGUE_ACTIONS.locationVoiture.title)
    ).toHaveCount(0)
  })

  test('I add the action to my plan', async ({
    page,
    actionsCatalogue,
    actionDetail,
  }) => {
    await actionDetail.commitmentButton().click()

    // The banner's button reads « Ajouté », and the commitment is notified
    await expect(
      actionsCatalogue.toast("Ajouté à votre plan d'action").first()
    ).toBeVisible()
    await expect(actionDetail.committedButton()).toBeVisible()

    // Only this action is added: the other actions below still offer to be
    await expect(actionsCatalogue.addedButton(page)).toHaveCount(1)
    await expect(
      actionsCatalogue.addButton(
        actionDetail.otherThemeActionCard(ecoconduite.title)
      )
    ).toBeVisible()

    // The commitment is saved: still there after a full page load
    await page.reload()
    await expect(actionDetail.committedButton()).toBeVisible()
  })
})
