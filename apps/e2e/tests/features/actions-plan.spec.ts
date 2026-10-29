import {
  ASSESSMENT_WITH_MODEL_DEFAULTS,
  CATALOGUE_ACTIONS,
  type CatalogueActionKey,
} from '../helpers/actions'
import { test as base, expect } from '../local/actions'
import type { Locator } from '../local/fixtures'
import { ActionsCatalogue } from '../page-objects/actions-catalogue'
import { ActionsPlan } from '../page-objects/actions-plan'
import { NGCTest } from '../page-objects/ngc-test'
import { User } from '../page-objects/user'

/**
 * The action catalogue is seeded in the e2e database (local/actions), with
 * real model rules: the visitor's simulation is assessed by the site worker,
 * as in production. Every question is skipped, so the simulation is answered
 * with the model's defaults and the personalized catalogue is known in advance
 * (ASSESSMENT_WITH_MODEL_DEFAULTS).
 *
 * The default context is a fresh new visitor (localVisitorState): the
 * scenario starts anonymous and creates its account along the way.
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

/** « Vos 3 actions clés », in order. */
const TOP_ACTION_TITLES = ASSESSMENT_WITH_MODEL_DEFAULTS.topActions.map(
  (key) => CATALOGUE_ACTIONS[key].title
)

/** The actions of the plan saved when creating the account. */
const SAVED_PLAN_ACTIONS = [
  'reduireViande',
  'eviterDeperditionsChaleur',
  'vacancesEnTrain',
] as const satisfies readonly CatalogueActionKey[]

test.setTimeout(250_000)

test.describe('Actions plan', () => {
  test('a visitor builds an action plan from its personalized catalogue, then saves it by creating an account', async ({
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
      await expect(
        page.getByRole('link', { name: /Découvrir mes actions/ }).first()
      ).toBeVisible()
    })

    await test.step('I see the actions catalogue personalized to my answers', async () => {
      await page
        .getByRole('link', { name: /Découvrir mes actions/ })
        .first()
        .click()

      await expect(page).toHaveURL(
        new RegExp(`${ActionsCatalogue.PERSONALIZED_URL}$`)
      )
      await actionsCatalogue.waitForAssessments()
      await expect(actionsCatalogue.personalizedTitle()).toBeVisible()

      // My 3 key actions: the highest impacts, in that order. The impact
      // values depend on the model: only expect one to be displayed.
      await expect(
        actionsCatalogue.highlightedCards().getByRole('heading')
      ).toHaveText(TOP_ACTION_TITLES)
      for (const title of TOP_ACTION_TITLES) {
        const card = actionsCatalogue.highlightedCard(title)
        await expect(card).toContainText('Impact potentiel')
        await expect(card).toContainText(/\d\s*t\s*CO2e \/ an/)
        await expect(actionsCatalogue.addButton(card)).toBeVisible()
      }

      // The other actions that apply to me, under their theme
      for (const key of ASSESSMENT_WITH_MODEL_DEFAULTS.otherApplicableActions) {
        const { title, theme } = CATALOGUE_ACTIONS[key]
        await expect(
          actionsCatalogue.themeCard(theme.title, title)
        ).toBeVisible()
      }

      // The actions that don't apply to me are not suggested
      for (const key of ASSESSMENT_WITH_MODEL_DEFAULTS.hiddenActions) {
        const { title } = CATALOGUE_ACTIONS[key]
        await expect(page.getByText(title)).toHaveCount(0)
      }

      await expect(actionsCatalogue.basketItems()).toHaveCount(0)
      await expect(actionsCatalogue.basket()).toContainText(
        'Votre sélection est vide'
      )
      await expect(actionsCatalogue.disabledSavePlanButton()).toBeDisabled()
      await expect(actionsCatalogue.disabledSavePlanButton()).toHaveText(
        "Sauvegarder mon plan d'action"
      )
    })

    await test.step('My plan is empty: its page asks me to log in, and I go back to the catalogue', async () => {
      // Nothing added yet: the count badge of my plan is at 0
      await expect(actionsCatalogue.myPlanLink()).toContainText('0')
      await actionsCatalogue.myPlanLink().click()

      // An anonymous visitor has no plan page: it asks to log in first (the
      // plan page's own empty state is only shown to a logged-in user)
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

      await page.goBack()

      await expect(page).toHaveURL(
        new RegExp(`${ActionsCatalogue.PERSONALIZED_URL}$`)
      )
      await expect(actionsCatalogue.highlightedSection()).toBeVisible()
      await expect(actionsCatalogue.basketItems()).toHaveCount(0)
    })

    await test.step('I add 2 highlighted actions and 3 other actions to my plan', async () => {
      const addedTitles: string[] = []

      // From my key actions: a highlighted action is listed in its theme
      // section too, and both of its cards read « Ajouté »
      for (const key of ['reduireViande', 'ecoconduite'] as const) {
        const { title, theme } = CATALOGUE_ACTIONS[key]
        const card = actionsCatalogue.highlightedCard(title)
        await actionsCatalogue.addButton(card).click()
        addedTitles.push(title)

        await expect(actionsCatalogue.addedButton(card)).toBeVisible()
        await expect(
          actionsCatalogue.addedButton(
            actionsCatalogue.themeCard(theme.title, title)
          )
        ).toBeVisible()
        await expect(actionsCatalogue.basketItem(title)).toBeVisible()
        await expect(actionsCatalogue.basketItems()).toHaveCount(
          addedTitles.length
        )
      }

      // From the theme sections (within the first slides of each carousel)
      for (const key of [
        'reduireBoissonsSucrees',
        'eviterDeperditionsChaleur',
        'achatReconditionne',
      ] as const) {
        const { title, theme } = CATALOGUE_ACTIONS[key]
        const card = actionsCatalogue.themeCard(theme.title, title)
        await actionsCatalogue.addButton(card).click()
        addedTitles.push(title)

        await expect(actionsCatalogue.addedButton(card)).toBeVisible()
        await expect(actionsCatalogue.basketItem(title)).toBeVisible()
        await expect(actionsCatalogue.basketItems()).toHaveCount(
          addedTitles.length
        )
      }

      // My selection holds the 5 actions (listed by impact, not in the order I
      // added them), ready to be saved as my plan
      await expect(actionsCatalogue.basketItems()).toHaveCount(5)
      for (const title of addedTitles) {
        await expect(actionsCatalogue.basketItem(title)).toBeVisible()
      }
      await expect(actionsCatalogue.basket()).toContainText(
        '5 actions dans votre sélection'
      )
      await expect(actionsCatalogue.savePlanLink()).toBeVisible()
      await expect(actionsCatalogue.myPlanLink()).toContainText('5')
    })

    await test.step('I remove actions from the basket, a highlighted card and a regular card', async () => {
      // Each removal is notified with a way to undo it (left unused here), and
      // every card of the action offers to add it again. The toast shows on
      // click and fades out after 5s, whatever the server takes: check it
      // first. The toast of the previous removal would pass for it: wait for
      // it to fade out before removing the next action.
      const removeAndExpectRemoved = async (
        removeButton: Locator,
        key: CatalogueActionKey,
        basketItemsLeft: number
      ) => {
        const toasts = actionsCatalogue.toast('Action retirée de votre plan')
        await expect(toasts).toHaveCount(0)
        await removeButton.click()
        await expect(toasts).toHaveCount(1)
        await expect(
          toasts.getByRole('button', { name: 'Annuler' })
        ).toBeVisible()
        const { title, theme } = CATALOGUE_ACTIONS[key]
        await expect(actionsCatalogue.basketItem(title)).toHaveCount(0)
        await expect(actionsCatalogue.basketItems()).toHaveCount(
          basketItemsLeft
        )
        await expect(
          actionsCatalogue.addButton(
            actionsCatalogue.themeCard(theme.title, title)
          )
        ).toBeVisible()
      }

      // From my selection
      await removeAndExpectRemoved(
        actionsCatalogue.removeFromBasketButton(
          CATALOGUE_ACTIONS.achatReconditionne.title
        ),
        'achatReconditionne',
        4
      )

      // From my key actions: the highlighted action stays highlighted
      const ecoconduiteCard = actionsCatalogue.highlightedCard(
        CATALOGUE_ACTIONS.ecoconduite.title
      )
      await removeAndExpectRemoved(
        actionsCatalogue.addedButton(ecoconduiteCard),
        'ecoconduite',
        3
      )
      await expect(actionsCatalogue.addButton(ecoconduiteCard)).toBeVisible()

      // From a theme section
      const { title, theme } = CATALOGUE_ACTIONS.reduireBoissonsSucrees
      await removeAndExpectRemoved(
        actionsCatalogue.addedButton(
          actionsCatalogue.themeCard(theme.title, title)
        ),
        'reduireBoissonsSucrees',
        2
      )

      // My selection keeps the 2 other actions
      for (const key of [
        'reduireViande',
        'eviterDeperditionsChaleur',
      ] as const) {
        const { title, theme } = CATALOGUE_ACTIONS[key]
        await expect(actionsCatalogue.basketItem(title)).toBeVisible()
        await expect(
          actionsCatalogue.addedButton(
            actionsCatalogue.themeCard(theme.title, title)
          )
        ).toBeVisible()
      }
      await expect(actionsCatalogue.basket()).toContainText(
        '2 actions dans votre sélection'
      )
      await expect(actionsCatalogue.myPlanLink()).toContainText('2')
    })

    await test.step('I open the detail page of an action', async () => {
      const { title, slug, theme } = CATALOGUE_ACTIONS.vacancesEnTrain
      await actionsCatalogue
        .actionLink(actionsCatalogue.themeCard(theme.title, title), title)
        .click()

      await expect(page).toHaveURL(
        `/actions/${theme.slug}/${slug}?from=mes-suggestions`
      )
      await expect(actionDetail.title()).toHaveText(title)
      await expect(actionDetail.header()).toContainText(theme.title)

      // Its content: the « Je comprends l'enjeu » section is always there,
      // its text varies
      await expect(actionDetail.understandSection()).toBeVisible()
      await expect(
        actionDetail.understandSection().getByRole('heading', { level: 3 })
      ).not.toBeEmpty()

      // Its impact can't be quantified for my simulation: no « Réduction max
      // sur votre empreinte » block. As it applies to me, I can still commit
      // to it, and I haven't yet.
      await expect(actionDetail.header()).not.toContainText(
        'Réduction max sur votre empreinte'
      )
      await expect(actionDetail.commitmentButton()).toBeVisible()
      await expect(actionsCatalogue.addedButton(page)).toHaveCount(0)

      // The other Transport actions are personalized too: the most impactful
      // first (ecoconduite, removed from my plan in the previous step), with
      // its impact, and without the one that doesn't apply to me
      const ecoconduite = CATALOGUE_ACTIONS.ecoconduite
      await expect(
        actionDetail.otherThemeActionCards().first().getByRole('heading')
      ).toHaveText(ecoconduite.title)
      const ecoconduiteCard = actionDetail.otherThemeActionCard(
        ecoconduite.title
      )
      await expect(ecoconduiteCard).toContainText(/Jusqu.à .+CO2e \/ an/)
      await expect(actionsCatalogue.addButton(ecoconduiteCard)).toBeVisible()
      await expect(
        actionDetail.otherThemeActionCard(
          CATALOGUE_ACTIONS.locationVoiture.title
        )
      ).toHaveCount(0)

      // « ← Retour » leads back to my personalized catalogue
      await expect(actionDetail.goBackLink()).toHaveAttribute(
        'href',
        ActionsCatalogue.PERSONALIZED_URL
      )
    })

    await test.step('I add the action to my plan from its detail page', async () => {
      await actionDetail.commitmentButton().click()

      // The banner's button reads « Ajouté », and the commitment is notified
      await expect(actionDetail.committedButton()).toBeVisible()
      await expect(
        actionsCatalogue.toast("Ajouté à votre plan d'action").first()
      ).toBeVisible()

      // Only this action is added: the other Transport actions below still
      // offer to be added
      await expect(actionsCatalogue.addedButton(page)).toHaveCount(1)
      await expect(
        actionsCatalogue.addButton(
          actionDetail.otherThemeActionCard(CATALOGUE_ACTIONS.ecoconduite.title)
        )
      ).toBeVisible()
    })

    await test.step('I go back to the catalogue', async () => {
      await actionDetail.goBackLink().click()

      // Exactly the catalogue: a /mes-suggestions/ pattern would already
      // match the detail page's `?from=mes-suggestions`
      await expect(page).toHaveURL(
        new RegExp(`${ActionsCatalogue.PERSONALIZED_URL}$`)
      )
      await expect(actionsCatalogue.personalizedTitle()).toBeVisible()

      // My key actions are unchanged: only reduireViande is in my plan
      await expect(
        actionsCatalogue.highlightedCards().getByRole('heading')
      ).toHaveText(TOP_ACTION_TITLES)
      for (const title of TOP_ACTION_TITLES) {
        const card = actionsCatalogue.highlightedCard(title)
        await expect(
          title === CATALOGUE_ACTIONS.reduireViande.title
            ? actionsCatalogue.addedButton(card)
            : actionsCatalogue.addButton(card)
        ).toBeVisible()
      }

      // The action added from its detail page reads « Ajouté » here too, and
      // joins my selection with the 2 others
      for (const key of SAVED_PLAN_ACTIONS) {
        const { title, theme } = CATALOGUE_ACTIONS[key]
        await expect(
          actionsCatalogue.addedButton(
            actionsCatalogue.themeCard(theme.title, title)
          )
        ).toBeVisible()
        await expect(actionsCatalogue.basketItem(title)).toBeVisible()
      }
      await expect(actionsCatalogue.basketItems()).toHaveCount(
        SAVED_PLAN_ACTIONS.length
      )
      await expect(actionsCatalogue.basket()).toContainText(
        '3 actions dans votre sélection'
      )
      // Each item shows its impact: a value (it depends on the model), or
      // that it can't be quantified
      await expect(
        actionsCatalogue.basketItem(CATALOGUE_ACTIONS.reduireViande.title)
      ).toContainText(/Jusqu.à .+CO2e \/ an/)
      await expect(
        actionsCatalogue.basketItem(CATALOGUE_ACTIONS.vacancesEnTrain.title)
      ).toContainText('Impact non quantifiable')
      await expect(actionsCatalogue.savePlanLink()).toBeVisible()
      await expect(actionsCatalogue.myPlanLink()).toContainText('3')
    })

    // The account I create to save my plan: a unique email, verified with the
    // code sent to the stub mailbox
    const user = new User(page)

    await test.step('I save my plan by creating an account', async () => {
      await actionsCatalogue.savePlanLink().click()

      // As an anonymous visitor, saving my plan asks me to log in first
      await expect(page).toHaveURL(/\/connexion\?from=build-action-plan$/)
      await page.getByRole('tab', { name: 'Créer un compte' }).click()

      // I don't have an account yet: I create one, still to reach my plan
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

      await user.fillEmailAndCompleteVerification()

      // Once verified, I land on my plan, logged in with my new account: my
      // space offers its verified user tabs. (The header keeps its anonymous
      // « Mon espace » link until the next full page load: not asserted.)
      await expect(page).toHaveURL(ActionsPlan.URL)
      await expect(actionsPlan.title()).toBeVisible()
      const mySpaceTabs = actionsCatalogue.mySpaceTabs()
      for (const name of ['Tests collectifs', 'Paramètres']) {
        await expect(mySpaceTabs.getByRole('tab', { name })).toBeVisible()
      }
      await expect(actionsCatalogue.myPlanLink()).toHaveAttribute(
        'aria-current',
        'page'
      )

      // Signing up keeps the actions I chose as a visitor: my plan holds the
      // 3 actions of my selection
      await expect(actionsPlan.summary()).toHaveText(
        'Vous avez ajouté 3 actions à votre plan.'
      )
      await expect(actionsCatalogue.myPlanLink()).toContainText('3')
      await expect(actionsPlan.tiles()).toHaveCount(3)
      for (const key of SAVED_PLAN_ACTIONS) {
        await expect(
          actionsPlan.tile(CATALOGUE_ACTIONS[key].title)
        ).toBeVisible()
      }
      await expect(
        actionsPlan.tile(CATALOGUE_ACTIONS.reduireViande.title)
      ).toContainText(/Jusqu.à .+CO2e \/ an/)
    })

    await test.step('As a verified user, I go back to my personalized catalogue', async () => {
      await actionsCatalogue.exploreActionsLink().click()

      await expect(page).toHaveURL(
        new RegExp(`${ActionsCatalogue.PERSONALIZED_URL}$`)
      )
      await expect(actionsCatalogue.personalizedTitle()).toBeVisible()
      // Still in my space, with its verified user tabs
      const mySpaceTabs = actionsCatalogue.mySpaceTabs()
      await expect(
        mySpaceTabs.getByRole('tab', { name: "J'agis" })
      ).toHaveAttribute('aria-selected', 'true')
      for (const name of ['Tests collectifs', 'Paramètres']) {
        await expect(mySpaceTabs.getByRole('tab', { name })).toBeVisible()
      }

      // My account keeps the simulation I made as a visitor: the same key
      // actions, with their impact, and only reduireViande in my plan
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

      // The 3 actions of my saved plan read « Ajouté » and fill my selection
      for (const key of SAVED_PLAN_ACTIONS) {
        const { title, theme } = CATALOGUE_ACTIONS[key]
        await expect(
          actionsCatalogue.addedButton(
            actionsCatalogue.themeCard(theme.title, title)
          )
        ).toBeVisible()
        await expect(actionsCatalogue.basketItem(title)).toBeVisible()
      }
      await expect(actionsCatalogue.basketItems()).toHaveCount(
        SAVED_PLAN_ACTIONS.length
      )
      await expect(actionsCatalogue.basket()).toContainText(
        '3 actions dans votre sélection'
      )
      await expect(actionsCatalogue.myPlanLink()).toContainText('3')

      // Logged in, saving my plan leads straight to my plan page
      await expect(actionsCatalogue.savePlanLink()).toHaveAttribute(
        'href',
        ActionsPlan.URL
      )
    })

    await test.step('I add another action', async () => {
      const { title, theme } = CATALOGUE_ACTIONS.engagementAssociatif
      const card = actionsCatalogue.themeCard(theme.title, title)
      await actionsCatalogue.addButton(card).click()

      // The card reads « Ajouté », and the commitment is notified
      await expect(actionsCatalogue.addedButton(card)).toBeVisible()
      await expect(
        actionsCatalogue.toast("Ajouté à votre plan d'action").first()
      ).toBeVisible()

      // It joins my selection, next to the 3 actions of my saved plan
      const planActions = [
        ...SAVED_PLAN_ACTIONS,
        'engagementAssociatif',
      ] as const
      for (const key of planActions) {
        await expect(
          actionsCatalogue.basketItem(CATALOGUE_ACTIONS[key].title)
        ).toBeVisible()
      }
      await expect(actionsCatalogue.basketItems()).toHaveCount(
        planActions.length
      )
      await expect(actionsCatalogue.basket()).toContainText(
        '4 actions dans votre sélection'
      )
      await expect(actionsCatalogue.basketItem(title)).toContainText(
        'Impact non quantifiable'
      )
      await expect(actionsCatalogue.myPlanLink()).toContainText('4')
    })

    await test.step('I navigate to my plan', async () => {
      await expect(actionsCatalogue.myPlanLink()).toContainText('4')
      await actionsCatalogue.myPlanLink().click()

      await expect(page).toHaveURL(ActionsPlan.URL)
      await expect(actionsPlan.title()).toBeVisible()
      // Still in my space, on its « J'agis » tab, with my plan as the current
      // page
      await expect(
        actionsCatalogue.mySpaceTabs().getByRole('tab', { name: "J'agis" })
      ).toHaveAttribute('aria-selected', 'true')
      await expect(actionsCatalogue.myPlanLink()).toHaveAttribute(
        'aria-current',
        'page'
      )
      await expect(actionsCatalogue.exploreActionsLink()).not.toHaveAttribute(
        'aria-current'
      )

      // My plan holds the 4 actions saved so far, in 4 themes (one action
      // each), and lets me explore other actions
      await expect(actionsPlan.summary()).toHaveText(
        'Vous avez ajouté 4 actions à votre plan.'
      )
      await expect(actionsCatalogue.myPlanLink()).toContainText('4')
      await expect(actionsPlan.tiles()).toHaveCount(4)
      await expect(actionsPlan.themeHeadings()).toHaveCount(4)
      await expect(actionsPlan.exploreOtherActionsLink()).toHaveAttribute(
        'href',
        ActionsCatalogue.PERSONALIZED_URL
      )
    })

    await test.step('My plan lists the saved actions, each linking to its detail page', async () => {
      // A full page load: what follows is read from the server, not from the
      // client state left by the previous steps
      await page.reload()
      await expect(actionsPlan.title()).toBeVisible()

      // Now the header knows I'm logged in with my new account
      await expect(
        page.getByRole('button', {
          name: `Mon espace (${user.email}), ouvrir le menu`,
          exact: true,
        })
      ).toBeVisible()

      // Each saved action has its tile under its theme (in any order), with
      // its impact, a button to remove it, and a link to its detail page
      await expect(actionsPlan.summary()).toHaveText(
        'Vous avez ajouté 4 actions à votre plan.'
      )
      for (const key of [
        ...SAVED_PLAN_ACTIONS,
        'engagementAssociatif',
      ] as const) {
        const { title, slug, theme } = CATALOGUE_ACTIONS[key]
        await expect(actionsPlan.themeTile(theme.title, title)).toBeVisible()
        // The impact value depends on the model: only check there is one
        await expect(actionsPlan.tile(title)).toContainText(
          key === 'reduireViande'
            ? /Jusqu.à .+CO2e \/ an/
            : 'Impact non quantifiable'
        )
        await expect(actionsPlan.removeButton(title)).toBeVisible()
        await expect(actionsPlan.detailLink(title)).toHaveAttribute(
          'href',
          `/actions/${theme.slug}/${slug}?from=mon-plan`
        )
      }

      // The tile leads to the detail page, which leads back to my plan
      const { title, slug, theme } = CATALOGUE_ACTIONS.engagementAssociatif
      await actionsPlan.detailLink(title).click()
      await expect(page).toHaveURL(
        `/actions/${theme.slug}/${slug}?from=mon-plan`
      )
      await expect(actionDetail.title()).toHaveText(title)
      await expect(actionDetail.committedButton()).toBeVisible()
      await expect(actionDetail.goBackLink()).toHaveAttribute(
        'href',
        ActionsPlan.URL
      )
      await actionDetail.goBackLink().click()

      await expect(page).toHaveURL(ActionsPlan.URL)
      await expect(actionsPlan.tile(title)).toBeVisible()
      await expect(actionsPlan.summary()).toHaveText(
        'Vous avez ajouté 4 actions à votre plan.'
      )
    })

    await test.step('I remove an action from my plan page', async () => {
      const removed = CATALOGUE_ACTIONS.reduireViande
      const keptActions = [
        'eviterDeperditionsChaleur',
        'vacancesEnTrain',
        'engagementAssociatif',
      ] as const

      // The removal is notified with a way to undo it (left unused here). The
      // toast shows on click and fades out after 5s: check it first.
      await actionsPlan.removeButton(removed.title).click()
      const toast = actionsCatalogue
        .toast('Action retirée de votre plan')
        .first()
      await expect(toast).toBeVisible()
      await expect(toast.getByRole('button', { name: 'Annuler' })).toBeVisible()

      // It updates my plan in place: the tile is gone, along with its theme
      // (it was its only action there)
      const expectPlanWithoutRemovedAction = async () => {
        await expect(actionsPlan.tile(removed.title)).toHaveCount(0)
        await expect(actionsPlan.themeSection(removed.theme.title)).toHaveCount(
          0
        )
        await expect(actionsPlan.tiles()).toHaveCount(keptActions.length)
        await expect(actionsPlan.themeHeadings()).toHaveCount(
          keptActions.length
        )
        for (const key of keptActions) {
          const { title, theme } = CATALOGUE_ACTIONS[key]
          await expect(actionsPlan.themeTile(theme.title, title)).toBeVisible()
        }
        await expect(actionsPlan.summary()).toHaveText(
          'Vous avez ajouté 3 actions à votre plan.'
        )
        await expect(actionsCatalogue.myPlanLink()).toContainText('3')
      }
      await expectPlanWithoutRemovedAction()

      // The removal is saved: it's still gone after a full page load
      await page.reload()
      await expect(actionsPlan.title()).toBeVisible()
      await expectPlanWithoutRemovedAction()
    })
  })
})
