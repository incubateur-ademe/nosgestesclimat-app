import { CATALOGUE_ACTIONS, type CatalogueActionKey } from '../helpers/actions'
import { expect, test } from '../local/actions'
import { ActionDetail } from '../page-objects/action-detail'
import { ActionsCatalogue } from '../page-objects/actions-catalogue'
import { ActionsPlan } from '../page-objects/actions-plan'

/**
 * The plan page (/actions/mon-plan) of a user whose simulation is seeded and
 * assessed (SEEDED_ASSESSMENTS).
 */

/** One action per theme. */
const PLAN = [
  'reduireViande',
  'eviterDeperditionsChaleur',
  'vacancesEnTrain',
  'engagementAssociatif',
] as const satisfies readonly CatalogueActionKey[]

test.describe('Actions plan page', () => {
  test('As a visitor, it asks me to log in or create an account to reach my plan', async ({
    page,
    signInAssessedUser,
  }) => {
    await signInAssessedUser({ plan: PLAN })
    await page.goto(ActionsPlan.URL)

    await expect(page).toHaveURL(/\/connexion\?from=build-action-plan$/)
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Connectez-vous pour accéder à votre plan d’action',
      })
    ).toBeVisible()
    await expect(
      page.getByRole('tab', { name: 'Se connecter' })
    ).toHaveAttribute('aria-selected', 'true')
    await expect(
      page.getByRole('button', {
        name: 'Me connecter et voir mon plan d’action',
      })
    ).toBeVisible()

    await page.getByRole('tab', { name: 'Créer un compte' }).click()

    await expect(page).toHaveURL(/\/inscription\?from=build-action-plan$/)
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Créez votre espace pour accéder à votre plan d’action',
      })
    ).toBeVisible()
    await expect(
      page.getByRole('tab', { name: 'Créer un compte' })
    ).toHaveAttribute('aria-selected', 'true')
    await expect(
      page.getByRole('button', {
        name: 'M’inscrire et voir mon plan d’action',
      })
    ).toBeVisible()
  })

  test.describe('As a verified user', () => {
    let email: string | null

    test.beforeEach(async ({ page, signInAssessedUser }) => {
      const actionsPlan = new ActionsPlan(page)

      ;({ email } = await signInAssessedUser({ verified: true, plan: PLAN }))
      await page.goto(ActionsPlan.URL)
      await expect(actionsPlan.title()).toBeVisible()
    })

    test('it sits in my space, with my plan as the current page', async ({
      page,
    }) => {
      const actionsCatalogue = new ActionsCatalogue(page)

      await expect(
        page.getByRole('button', {
          name: `Mon espace (${email}), ouvrir le menu`,
          exact: true,
        })
      ).toBeVisible()

      const mySpaceTabs = actionsCatalogue.mySpaceTabs()
      await expect(
        mySpaceTabs.getByRole('tab', { name: "J'agis" })
      ).toHaveAttribute('aria-selected', 'true')
      for (const name of ['Tests collectifs', 'Paramètres']) {
        await expect(mySpaceTabs.getByRole('tab', { name })).toBeVisible()
      }

      await expect(actionsCatalogue.myPlanLink()).toHaveAttribute(
        'aria-current',
        'page'
      )
      await expect(actionsCatalogue.exploreActionsLink()).not.toHaveAttribute(
        'aria-current'
      )
    })

    test('it lists my actions by theme, each with its impact, a way to remove it and a link to its detail page', async ({
      page,
    }) => {
      const actionsCatalogue = new ActionsCatalogue(page)
      const actionsPlan = new ActionsPlan(page)

      await expect(actionsPlan.summary()).toHaveText(
        'Vous avez ajouté 4 actions à votre plan.'
      )
      await expect(actionsCatalogue.myPlanLink()).toContainText('4')
      await expect(actionsPlan.tiles()).toHaveCount(PLAN.length)
      await expect(actionsPlan.themeHeadings()).toHaveCount(PLAN.length)

      for (const key of PLAN) {
        const { title, theme } = CATALOGUE_ACTIONS[key]
        await expect(actionsPlan.themeTile(theme.title, title)).toBeVisible()
        await expect(actionsPlan.tile(title)).toContainText(
          key === 'reduireViande'
            ? /Jusqu.à .+CO2e \/ an/
            : 'Impact non quantifiable'
        )
        await expect(actionsPlan.removeButton(title)).toBeVisible()
        await expect(actionsPlan.detailLink(title)).toHaveAttribute(
          'href',
          ActionDetail.url(CATALOGUE_ACTIONS[key], 'mon-plan')
        )
      }

      await expect(actionsPlan.exploreOtherActionsLink()).toHaveAttribute(
        'href',
        ActionsCatalogue.PERSONALIZED_URL
      )
    })

    test('a tile leads to the detail page of its action, which leads back to my plan', async ({
      page,
    }) => {
      const actionDetail = new ActionDetail(page)
      const actionsPlan = new ActionsPlan(page)

      const action = CATALOGUE_ACTIONS.engagementAssociatif
      await actionsPlan.detailLink(action.title).click()

      await expect(page).toHaveURL(ActionDetail.url(action, 'mon-plan'))
      await expect(actionDetail.title()).toHaveText(action.title)
      await expect(actionDetail.committedButton()).toBeVisible()

      await actionDetail.goBackLink().click()

      await expect(page).toHaveURL(ActionsPlan.URL)
      await expect(actionsPlan.tile(action.title)).toBeVisible()
    })

    test('it leads to my personalized catalogue', async ({ page }) => {
      const actionsCatalogue = new ActionsCatalogue(page)

      await actionsCatalogue.exploreActionsLink().click()

      await expect(page).toHaveURL(
        new RegExp(`${ActionsCatalogue.PERSONALIZED_URL}$`)
      )
      await expect(actionsCatalogue.personalizedTitle()).toBeVisible()
    })

    test('I remove an action: my plan updates in place, and the removal is saved', async ({
      page,
    }) => {
      const actionsCatalogue = new ActionsCatalogue(page)
      const actionsPlan = new ActionsPlan(page)

      const removed = CATALOGUE_ACTIONS.reduireViande
      const kept = PLAN.filter((key) => key !== 'reduireViande')

      // The removal is notified with a way to undo it (left unused here). The
      // toast shows on click and fades out after 5s: check it first.
      await actionsPlan.removeButton(removed.title).click()
      const toast = actionsCatalogue
        .toast('Action retirée de votre plan')
        .first()
      await expect(toast).toBeVisible()
      await expect(toast.getByRole('button', { name: 'Annuler' })).toBeVisible()

      // The tile is gone, along with its theme (it was its only action there)
      const expectPlanWithoutRemovedAction = async () => {
        await expect(actionsPlan.tile(removed.title)).toHaveCount(0)
        await expect(actionsPlan.themeSection(removed.theme.title)).toHaveCount(
          0
        )
        await expect(actionsPlan.tiles()).toHaveCount(kept.length)
        await expect(actionsPlan.themeHeadings()).toHaveCount(kept.length)
        for (const key of kept) {
          const { title, theme } = CATALOGUE_ACTIONS[key]
          await expect(actionsPlan.themeTile(theme.title, title)).toBeVisible()
        }
        await expect(actionsPlan.summary()).toHaveText(
          'Vous avez ajouté 3 actions à votre plan.'
        )
        await expect(actionsCatalogue.myPlanLink()).toContainText('3')
      }
      await expectPlanWithoutRemovedAction()

      await page.reload()
      await expect(actionsPlan.title()).toBeVisible()
      await expectPlanWithoutRemovedAction()
    })
  })
})
