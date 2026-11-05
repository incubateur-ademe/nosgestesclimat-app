import {
  ASSESSMENT_WITH_MODEL_DEFAULTS,
  CATALOGUE_ACTIONS,
  type CatalogueActionKey,
} from '../helpers/actions'
import { test as base, expect } from '../local/actions'
import { ActionDetail } from '../page-objects/action-detail'
import { ActionsCatalogue } from '../page-objects/actions-catalogue'
import { ActionsPlan } from '../page-objects/actions-plan'
import { NGCTest } from '../page-objects/ngc-test'
import { User } from '../page-objects/user'

/**
 * The whole flow, from the home page to the saved plan, with the real test and
 * site worker: the content of each page is covered by its own spec, on seeded
 * data (personalized-actions-catalogue, personalized-action-detail,
 * actions-plan-page).
 *
 * Every question is skipped, so the simulation is answered with the model's
 * defaults and the personalized catalogue is known in advance
 * (ASSESSMENT_WITH_MODEL_DEFAULTS). The default context is a fresh new visitor
 * (localVisitorState): the scenario starts anonymous and creates its account
 * along the way.
 */
const test = base.extend<{
  ngcTest: NGCTest
  actionsPlan: ActionsPlan
}>({
  ngcTest: async ({ page }, use) => {
    await use(new NGCTest(page))
  },
  actionsPlan: async ({ page }, use) => {
    await use(new ActionsPlan(page))
  },
})

/** The actions of the plan saved when creating the account. */
const SAVED_PLAN_ACTIONS = [
  'reduireViande',
  'eviterDeperditionsChaleur',
  'vacancesEnTrain',
] as const satisfies readonly CatalogueActionKey[]

test.setTimeout(120_000)

test('a visitor completes the test, builds an action plan from their personalized catalogue, then saves it by creating an account', async ({
  page,
  ngcTest,
  actionsCatalogue,
  actionDetail,
  actionsPlan,
}) => {
  await test.step('As a visitor, I complete a simulation from the home page', async () => {
    await page.goto('/')
    await page.getByTestId('main-cta').first().click()
    await ngcTest.tutorialPage.skip()
    await ngcTest.skipAllQuestions()

    await expect(page).toHaveURL(/\/fin/)
  })

  await test.step('I see the actions catalogue personalized to my answers, once they are assessed', async () => {
    await page
      .getByRole('link', { name: /Découvrir mes actions/ })
      .first()
      .click()

    await expect(page).toHaveURL(
      new RegExp(`${ActionsCatalogue.PERSONALIZED_URL}$`)
    )
    await actionsCatalogue.waitForAssessments()

    await expect(
      actionsCatalogue.highlightedCards().getByRole('heading')
    ).toHaveText(
      ASSESSMENT_WITH_MODEL_DEFAULTS.topActions.map(
        (key) => CATALOGUE_ACTIONS[key].title
      )
    )
    await expect(actionsCatalogue.basketItems()).toHaveCount(0)
  })

  await test.step('My plan is empty: its page asks me to log in, and I go back to the catalogue', async () => {
    await actionsCatalogue.myPlanLink().click()
    await expect(page).toHaveURL(/\/connexion\?from=build-action-plan$/)

    await page.goBack()
    await expect(page).toHaveURL(
      new RegExp(`${ActionsCatalogue.PERSONALIZED_URL}$`)
    )
    await expect(actionsCatalogue.highlightedSection()).toBeVisible()
  })

  await test.step('I add a highlighted action and 2 other actions to my plan', async () => {
    const viande = CATALOGUE_ACTIONS.reduireViande
    await actionsCatalogue
      .addButton(actionsCatalogue.highlightedCard(viande.title))
      .click()
    await expect(actionsCatalogue.basketItem(viande.title)).toBeVisible()

    for (const { title, theme } of [
      CATALOGUE_ACTIONS.eviterDeperditionsChaleur,
      CATALOGUE_ACTIONS.achatReconditionne,
    ]) {
      await actionsCatalogue
        .addButton(actionsCatalogue.themeCard(theme.title, title))
        .click()
      await expect(actionsCatalogue.basketItem(title)).toBeVisible()
    }

    await expect(actionsCatalogue.basketItems()).toHaveCount(3)
    await expect(actionsCatalogue.myPlanLink()).toContainText('3')
  })

  await test.step('I remove an action from my selection', async () => {
    const { title } = CATALOGUE_ACTIONS.achatReconditionne
    await actionsCatalogue.removeFromBasketButton(title).click()

    await expect(actionsCatalogue.basketItem(title)).toHaveCount(0)
    await expect(actionsCatalogue.basketItems()).toHaveCount(2)
    await expect(actionsCatalogue.myPlanLink()).toContainText('2')
  })

  await test.step('I open the detail page of an action, and add it to my plan', async () => {
    const action = CATALOGUE_ACTIONS.vacancesEnTrain
    await actionsCatalogue
      .actionLink(
        actionsCatalogue.themeCard(action.theme.title, action.title),
        action.title
      )
      .click()

    await expect(page).toHaveURL(ActionDetail.url(action, 'mes-suggestions'))
    await expect(actionDetail.title()).toHaveText(action.title)

    await actionDetail.commitmentButton().click()
    await expect(actionDetail.committedButton()).toBeVisible()
  })

  await test.step('I go back to the catalogue: the action joined my selection', async () => {
    await actionDetail.goBackLink().click()

    // Exactly the catalogue: a /mes-suggestions/ pattern would already match
    // the detail page's `?from=mes-suggestions`
    await expect(page).toHaveURL(
      new RegExp(`${ActionsCatalogue.PERSONALIZED_URL}$`)
    )
    for (const key of SAVED_PLAN_ACTIONS) {
      await expect(
        actionsCatalogue.basketItem(CATALOGUE_ACTIONS[key].title)
      ).toBeVisible()
    }
    await expect(actionsCatalogue.basketItems()).toHaveCount(
      SAVED_PLAN_ACTIONS.length
    )
  })

  // The account I create to save my plan: a unique email, verified with the
  // code sent to the stub mailbox
  const user = new User(page)

  await test.step('I save my plan by creating an account', async () => {
    await actionsCatalogue.savePlanLink().click()

    await expect(page).toHaveURL(/\/connexion\?from=build-action-plan$/)
    await page.getByRole('tab', { name: 'Créer un compte' }).click()
    await expect(page).toHaveURL(/\/inscription\?from=build-action-plan$/)

    await user.fillEmailAndCompleteVerification()

    await expect(page).toHaveURL(ActionsPlan.URL)
    await expect(actionsPlan.title()).toBeVisible()
  })

  await test.step('My account keeps the actions I chose as a visitor', async () => {
    // A full page load: this is read from the server, not from the client state
    // left by the previous steps. (Before it, the header keeps its anonymous
    // « Mon espace » link.)
    await page.reload()

    await expect(
      page.getByRole('button', {
        name: `Mon espace (${user.email}), ouvrir le menu`,
        exact: true,
      })
    ).toBeVisible()
    await expect(actionsPlan.tiles()).toHaveCount(SAVED_PLAN_ACTIONS.length)
    for (const key of SAVED_PLAN_ACTIONS) {
      await expect(actionsPlan.tile(CATALOGUE_ACTIONS[key].title)).toBeVisible()
    }
  })
})
