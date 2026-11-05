import {
  CATALOGUE_ACTIONS,
  SEEDED_ASSESSMENTS,
  type CatalogueActionKey,
} from '../helpers/actions'
import { expect, test } from '../local/actions'
import { ActionsCatalogue } from '../page-objects/actions-catalogue'
import { ActionsPlan } from '../page-objects/actions-plan'

/**
 * The personalized catalogue (/actions/mes-suggestions) of a user whose
 * simulation is seeded and assessed (SEEDED_ASSESSMENTS).
 */

/** « Vos 3 actions clés », in order: the highest numeric impacts. */
const TOP_ACTIONS = [
  'reduireViande',
  'ecoconduite',
  'faireDurerSesObjets',
] as const satisfies readonly CatalogueActionKey[]

const TOP_ACTION_TITLES = TOP_ACTIONS.map((key) => CATALOGUE_ACTIONS[key].title)

const assessedActionKeys = Object.keys(
  SEEDED_ASSESSMENTS
) as CatalogueActionKey[]

const APPLICABLE_ACTIONS = assessedActionKeys.filter(
  (key) => SEEDED_ASSESSMENTS[key].applicable
)

const HIDDEN_ACTIONS = assessedActionKeys.filter(
  (key) => !SEEDED_ASSESSMENTS[key].applicable
)

test.describe('Personalized actions catalogue', () => {
  test.describe('As a visitor', () => {
    test('it suggests the actions that apply to me, with an empty selection', async ({
      page,
      signInAssessedUser,
    }) => {
      const actionsCatalogue = new ActionsCatalogue(page)

      await signInAssessedUser()
      await page.goto(ActionsCatalogue.PERSONALIZED_URL)
      await expect(actionsCatalogue.personalizedTitle()).toBeVisible()

      // My 3 key actions: the highest impacts, in that order
      await expect(
        actionsCatalogue.highlightedCards().getByRole('heading')
      ).toHaveText(TOP_ACTION_TITLES)
      for (const title of TOP_ACTION_TITLES) {
        const card = actionsCatalogue.highlightedCard(title)
        await expect(card).toContainText('Impact potentiel')
        await expect(card).toContainText(/\d\s*t\s*CO2e \/ an/)
        await expect(actionsCatalogue.addButton(card)).toBeVisible()
      }

      // Every action that applies to me is listed under its theme, key actions
      // included
      for (const key of APPLICABLE_ACTIONS) {
        const { title, theme } = CATALOGUE_ACTIONS[key]
        await expect(
          actionsCatalogue.themeCard(theme.title, title)
        ).toBeVisible()
      }

      // The actions that don't apply to me are not suggested
      for (const key of HIDDEN_ACTIONS) {
        await expect(page.getByText(CATALOGUE_ACTIONS[key].title)).toHaveCount(
          0
        )
      }

      // Nothing is selected yet: there is no plan to save
      await expect(actionsCatalogue.basketItems()).toHaveCount(0)
      await expect(actionsCatalogue.basket()).toContainText(
        'Votre sélection est vide'
      )
      await expect(actionsCatalogue.disabledSavePlanButton()).toBeDisabled()
      await expect(actionsCatalogue.disabledSavePlanButton()).toHaveText(
        "Sauvegarder mon plan d'action"
      )
      await expect(actionsCatalogue.myPlanLink()).toContainText('0')
    })

    test('I add a highlighted action: both of its cards read « Ajouté », and it joins my selection', async ({
      page,
      signInAssessedUser,
    }) => {
      const actionsCatalogue = new ActionsCatalogue(page)

      await signInAssessedUser()
      await page.goto(ActionsCatalogue.PERSONALIZED_URL)

      const { title, theme } = CATALOGUE_ACTIONS.reduireViande
      const card = actionsCatalogue.highlightedCard(title)
      await actionsCatalogue.addButton(card).click()

      await expect(
        actionsCatalogue.toast("Ajouté à votre plan d'action").first()
      ).toBeVisible()
      await expect(actionsCatalogue.addedButton(card)).toBeVisible()
      await expect(
        actionsCatalogue.addedButton(
          actionsCatalogue.themeCard(theme.title, title)
        )
      ).toBeVisible()

      await expect(actionsCatalogue.basketItem(title)).toContainText(
        /Jusqu.à .+CO2e \/ an/
      )
      await expect(actionsCatalogue.basketItems()).toHaveCount(1)
      await expect(actionsCatalogue.savePlanLink()).toBeVisible()
      await expect(actionsCatalogue.myPlanLink()).toContainText('1')
    })

    test('I add an action from its theme section, whose impact cannot be quantified', async ({
      page,
      signInAssessedUser,
    }) => {
      const actionsCatalogue = new ActionsCatalogue(page)

      await signInAssessedUser()
      await page.goto(ActionsCatalogue.PERSONALIZED_URL)

      const { title, theme } = CATALOGUE_ACTIONS.engagementAssociatif
      const card = actionsCatalogue.themeCard(theme.title, title)
      await actionsCatalogue.addButton(card).click()

      await expect(
        actionsCatalogue.toast("Ajouté à votre plan d'action").first()
      ).toBeVisible()
      await expect(actionsCatalogue.addedButton(card)).toBeVisible()
      await expect(actionsCatalogue.basketItem(title)).toContainText(
        'Impact non quantifiable'
      )
      await expect(actionsCatalogue.myPlanLink()).toContainText('1')
    })

    test.describe('With 2 actions in my selection', () => {
      const SELECTION = [
        'reduireViande',
        'reduireBoissonsSucrees',
      ] as const satisfies readonly CatalogueActionKey[]

      test.beforeEach(async ({ page, signInAssessedUser }) => {
        const actionsCatalogue = new ActionsCatalogue(page)

        await signInAssessedUser({ plan: SELECTION })
        await page.goto(ActionsCatalogue.PERSONALIZED_URL)
        await expect(actionsCatalogue.basketItems()).toHaveCount(
          SELECTION.length
        )
      })

      /**
       * The removal is notified with a way to undo it (left unused here), and
       * the action can be added again. The toast shows on click and fades out
       * after 5s, whatever the server takes: check it first.
       */
      const expectRemoved = async (
        actionsCatalogue: ActionsCatalogue,
        key: CatalogueActionKey
      ) => {
        const toast = actionsCatalogue.toast('Action retirée de votre plan')
        await expect(toast).toHaveCount(1)
        await expect(
          toast.getByRole('button', { name: 'Annuler' })
        ).toBeVisible()

        const { title, theme } = CATALOGUE_ACTIONS[key]
        await expect(actionsCatalogue.basketItem(title)).toHaveCount(0)
        await expect(
          actionsCatalogue.addButton(
            actionsCatalogue.themeCard(theme.title, title)
          )
        ).toBeVisible()

        await expect(actionsCatalogue.basketItems()).toHaveCount(1)
        await expect(actionsCatalogue.myPlanLink()).toContainText('1')
      }

      test('I remove an action from my selection', async ({ page }) => {
        const actionsCatalogue = new ActionsCatalogue(page)

        await actionsCatalogue
          .removeFromBasketButton(
            CATALOGUE_ACTIONS.reduireBoissonsSucrees.title
          )
          .click()

        await expectRemoved(actionsCatalogue, 'reduireBoissonsSucrees')
        await expect(
          actionsCatalogue.basketItem(CATALOGUE_ACTIONS.reduireViande.title)
        ).toBeVisible()
      })

      test('I remove an action from a highlighted card', async ({ page }) => {
        const actionsCatalogue = new ActionsCatalogue(page)

        const card = actionsCatalogue.highlightedCard(
          CATALOGUE_ACTIONS.reduireViande.title
        )
        await actionsCatalogue.addedButton(card).click()

        await expectRemoved(actionsCatalogue, 'reduireViande')
        await expect(
          actionsCatalogue.basketItem(
            CATALOGUE_ACTIONS.reduireBoissonsSucrees.title
          )
        ).toBeVisible()

        // It stays highlighted
        await expect(actionsCatalogue.addButton(card)).toBeVisible()
        await expect(
          actionsCatalogue.highlightedCards().getByRole('heading')
        ).toHaveText(TOP_ACTION_TITLES)
      })

      test('I remove an action from a theme card', async ({ page }) => {
        const actionsCatalogue = new ActionsCatalogue(page)

        const { title, theme } = CATALOGUE_ACTIONS.reduireBoissonsSucrees
        await actionsCatalogue
          .addedButton(actionsCatalogue.themeCard(theme.title, title))
          .click()

        await expectRemoved(actionsCatalogue, 'reduireBoissonsSucrees')
        await expect(
          actionsCatalogue.basketItem(CATALOGUE_ACTIONS.reduireViande.title)
        ).toBeVisible()
      })
    })
  })

  test.describe('As a verified user', () => {
    const SAVED_PLAN = [
      'reduireViande',
      'eviterDeperditionsChaleur',
      'vacancesEnTrain',
    ] as const satisfies readonly CatalogueActionKey[]

    test.beforeEach(async ({ page, signInAssessedUser }) => {
      const actionsCatalogue = new ActionsCatalogue(page)

      await signInAssessedUser({ verified: true, plan: SAVED_PLAN })
      await page.goto(ActionsCatalogue.PERSONALIZED_URL)
      await expect(actionsCatalogue.personalizedTitle()).toBeVisible()
    })

    test('it sits in my space, with my saved plan as my selection', async ({
      page,
    }) => {
      const actionsCatalogue = new ActionsCatalogue(page)

      const mySpaceTabs = actionsCatalogue.mySpaceTabs()
      await expect(
        mySpaceTabs.getByRole('tab', { name: "J'agis" })
      ).toHaveAttribute('aria-selected', 'true')
      for (const name of ['Tests collectifs', 'Paramètres']) {
        await expect(mySpaceTabs.getByRole('tab', { name })).toBeVisible()
      }

      // My key actions don't change: only the one in my plan reads « Ajouté »
      await expect(
        actionsCatalogue.highlightedCards().getByRole('heading')
      ).toHaveText(TOP_ACTION_TITLES)
      for (const title of TOP_ACTION_TITLES) {
        const card = actionsCatalogue.highlightedCard(title)
        await expect(card).toContainText(/\d\s*t\s*CO2e \/ an/)
        await expect(
          title === CATALOGUE_ACTIONS.reduireViande.title
            ? actionsCatalogue.addedButton(card)
            : actionsCatalogue.addButton(card)
        ).toBeVisible()
      }

      for (const key of SAVED_PLAN) {
        const { title, theme } = CATALOGUE_ACTIONS[key]
        await expect(
          actionsCatalogue.addedButton(
            actionsCatalogue.themeCard(theme.title, title)
          )
        ).toBeVisible()
        await expect(actionsCatalogue.basketItem(title)).toBeVisible()
      }
      await expect(actionsCatalogue.basketItems()).toHaveCount(
        SAVED_PLAN.length
      )
      await expect(actionsCatalogue.basket()).toContainText(
        '3 actions dans votre sélection'
      )
      await expect(actionsCatalogue.myPlanLink()).toContainText('3')

      // Each item shows its impact: a value, or that it can't be quantified
      await expect(
        actionsCatalogue.basketItem(CATALOGUE_ACTIONS.reduireViande.title)
      ).toContainText(/Jusqu.à .+CO2e \/ an/)
      await expect(
        actionsCatalogue.basketItem(CATALOGUE_ACTIONS.vacancesEnTrain.title)
      ).toContainText('Impact non quantifiable')

      // Logged in, saving my plan leads straight to my plan page
      await expect(actionsCatalogue.savePlanLink()).toHaveAttribute(
        'href',
        ActionsPlan.URL
      )
    })

    test('I add another action next to my saved plan', async ({ page }) => {
      const actionsCatalogue = new ActionsCatalogue(page)

      const { title, theme } = CATALOGUE_ACTIONS.engagementAssociatif
      const card = actionsCatalogue.themeCard(theme.title, title)
      await actionsCatalogue.addButton(card).click()

      await expect(
        actionsCatalogue.toast("Ajouté à votre plan d'action").first()
      ).toBeVisible()
      await expect(actionsCatalogue.addedButton(card)).toBeVisible()

      await expect(actionsCatalogue.basketItem(title)).toContainText(
        'Impact non quantifiable'
      )
      await expect(actionsCatalogue.basketItems()).toHaveCount(
        SAVED_PLAN.length + 1
      )
      await expect(actionsCatalogue.basket()).toContainText(
        '4 actions dans votre sélection'
      )
      await expect(actionsCatalogue.myPlanLink()).toContainText('4')
    })
  })
})
