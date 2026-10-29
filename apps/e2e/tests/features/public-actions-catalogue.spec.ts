import {
  food,
  housing,
  misc,
  societalServices,
  transport,
} from '@nosgestesclimat/core/features/actions/data/themes/index'
import {
  CATALOGUE_ACTIONS,
  PUBLIC_HIGHLIGHTED_ACTIONS,
  type CatalogueActionKey,
} from '../helpers/actions'
import { expect, test } from '../local/actions'
import { ActionsCatalogue } from '../page-objects/actions-catalogue'

/**
 * Everything the site shows of an assessed action's impact: card tags
 * (« Jusqu'à … t CO2e / an », « Moins de … », « Impact non quantifiable »,
 * « En cours de calcul »), the highlighted cards' panel (« Impact potentiel »,
 * « soit N % de votre empreinte totale ») and the detail page's block
 * (« Réduction max sur votre empreinte »).
 */
const IMPACT_TEXT =
  /Impact potentiel|Jusqu.à|Moins de|Impact non quantifiable|En cours de calcul|CO2e \/ an|de votre empreinte totale|Réduction max sur votre empreinte/

/**
 * The theme sections, in the order of the themes, each listing all its
 * actions (none is hidden for lack of applicability), sorted by title.
 */
const THEME_SECTIONS = [
  {
    theme: housing,
    actions: ['eviterDeperditionsChaleur', 'consommationHeuresCreuses'],
  },
  {
    theme: food,
    actions: [
      'reduireViandeRouge',
      'reduireViande',
      'reduireBoissonsSucrees',
      'valoriserDechets',
    ],
  },
  {
    theme: transport,
    actions: [
      'ecoconduite',
      'petitsTrajetsSansVoiture',
      'limiterAvion',
      'locationVoiture',
      'vacancesEnTrain',
    ],
  },
  {
    theme: misc,
    actions: ['achatReconditionne', 'faireDurerSesObjets'],
  },
  { theme: societalServices, actions: ['engagementAssociatif'] },
] as const satisfies readonly {
  theme: { title: string }
  actions: readonly CatalogueActionKey[]
}[]

const titlesOf = (keys: readonly CatalogueActionKey[]) =>
  keys.map((key) => CATALOGUE_ACTIONS[key].title)

/**
 * The action catalogue is seeded in the e2e database (local/actions). The
 * default context is a fresh new visitor (localVisitorState): no session, so
 * no simulation. The actions are therefore not assessed: neither filtered by
 * applicability nor showing an impact, and they cannot be added to a plan.
 */
test.describe('Public actions catalogue', () => {
  test('an anonymous visitor browses the catalogue and reads an action, without any personalized impact', async ({
    page,
    actionsCatalogue,
    actionDetail,
  }) => {
    const highlightedAction = CATALOGUE_ACTIONS.reduireViande

    await test.step('As an anonymous visitor, I browse every action of the public catalogue', async () => {
      await page.goto(ActionsCatalogue.PUBLIC_URL)

      await expect(actionsCatalogue.publicTitle()).toBeVisible()
      await expect(
        page.getByRole('main').getByRole('link', { name: 'faire le test' })
      ).toBeVisible()

      // Highlighted actions: the curated ones, in order, each with its theme,
      // its description and a link to its detail page.
      await expect(
        actionsCatalogue.highlightedCards().getByRole('heading', { level: 3 })
      ).toHaveText(titlesOf(PUBLIC_HIGHLIGHTED_ACTIONS))
      for (const key of PUBLIC_HIGHLIGHTED_ACTIONS) {
        const { title, theme } = CATALOGUE_ACTIONS[key]
        const card = actionsCatalogue.highlightedCard(title)
        await expect(card).toContainText(theme.title)
        await expect(card.getByRole('paragraph')).not.toBeEmpty()
        await expect(actionsCatalogue.actionLink(card, title)).toBeVisible()
      }

      // Theme sections: every action, applicable or not, under its theme.
      await expect(
        page.getByRole('heading', {
          level: 2,
          name: 'Voici d’autres actions qui vous aideront à réduire votre empreinte',
        })
      ).toBeVisible()
      for (const { theme, actions } of THEME_SECTIONS) {
        const section = actionsCatalogue.themeSection(theme.title)
        // The carousel's heading and count sit just outside of it.
        const sectionHeader = page.locator('section').filter({ has: section })
        await expect(
          sectionHeader.getByRole('heading', {
            level: 2,
            name: theme.title,
            exact: true,
          })
        ).toBeVisible()
        await expect(sectionHeader).toContainText(
          `${actions.length} actions recommandées`
        )
        await expect(
          section.getByRole('article').getByRole('heading', { level: 3 })
        ).toHaveText(titlesOf(actions))
        for (const key of actions) {
          const { title: actionTitle } = CATALOGUE_ACTIONS[key]
          await expect(
            actionsCatalogue.actionLink(section, actionTitle)
          ).toBeAttached()
        }
      }

      // No impact, and nothing to build a plan with.
      await expect(page.getByRole('main')).not.toContainText(IMPACT_TEXT)
      await expect(actionsCatalogue.addButton(page)).toHaveCount(0)
      await expect(actionsCatalogue.addedButton(page)).toHaveCount(0)
      await expect(actionsCatalogue.basket()).toHaveCount(0)
      await expect(actionsCatalogue.myPlanLink()).toHaveCount(0)

      await expect(
        page.getByRole('heading', {
          level: 2,
          name: 'Connaissez-vous votre empreinte carbone ?',
        })
      ).toBeVisible()
    })

    await test.step('I open the detail page of a highlighted action', async () => {
      await actionsCatalogue
        .actionLink(
          actionsCatalogue.highlightedCard(highlightedAction.title),
          highlightedAction.title
        )
        .click()

      await expect(page).toHaveURL(
        `/actions/${highlightedAction.theme.slug}/${highlightedAction.slug}?from=index`
      )
      await expect(actionDetail.title()).toHaveText(highlightedAction.title)
      await expect(actionDetail.header()).toContainText(
        highlightedAction.theme.title
      )

      // Its content: the « Je comprends l'enjeu » section is always there,
      // its text varies.
      await expect(actionDetail.understandSection()).toBeVisible()
      await expect(
        actionDetail.understandSection().getByRole('heading', { level: 3 })
      ).not.toBeEmpty()

      // The other actions of its theme (Alimentation), applicable or not.
      const otherThemeActions = titlesOf([
        'reduireViandeRouge',
        'reduireBoissonsSucrees',
        'valoriserDechets',
      ])
      await expect(actionDetail.otherThemeActionCards()).toHaveCount(
        otherThemeActions.length
      )
      for (const title of otherThemeActions) {
        await expect(
          actionsCatalogue.actionLink(
            actionDetail.otherThemeActionsSection(),
            title
          )
        ).toBeAttached()
      }

      // No impact block, no commitment banner.
      await expect(page.getByRole('main')).not.toContainText(IMPACT_TEXT)
      await expect(actionsCatalogue.addButton(page)).toHaveCount(0)
      await expect(actionsCatalogue.addedButton(page)).toHaveCount(0)

      await expect(actionDetail.goBackLink()).toHaveAttribute(
        'href',
        ActionsCatalogue.PUBLIC_URL
      )
    })

    await test.step('I go back to the public catalogue', async () => {
      await actionDetail.goBackLink().click()

      await expect(page).toHaveURL(ActionsCatalogue.PUBLIC_URL)
      await expect(actionsCatalogue.publicTitle()).toBeVisible()
      await expect(
        actionsCatalogue.highlightedCards().getByRole('heading', { level: 3 })
      ).toHaveText(titlesOf(PUBLIC_HIGHLIGHTED_ACTIONS))
      await expect(page.getByRole('main')).not.toContainText(IMPACT_TEXT)
    })
  })
})
