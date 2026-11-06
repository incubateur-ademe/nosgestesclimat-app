import { expect, type Locator, type Page } from '@playwright/test'

/**
 * The actions catalogue: public (/actions) or personalized to the user's last
 * simulation (/actions/mes-suggestions). Both render the same sections; the
 * personalized one adds the plan links and the basket (« Ma sélection
 * d'actions »).
 *
 * The site has no test ids there: the locators rely on accessible roles and
 * names. Cards are matched by their exact title (heading).
 */
export class ActionsCatalogue {
  static PUBLIC_URL = '/actions'
  static PERSONALIZED_URL = '/actions/mes-suggestions'

  constructor(public readonly page: Page) {}

  /** The public catalogue's h1. Some cards render an h1 too: match its name. */
  publicTitle() {
    return this.page.getByRole('heading', {
      level: 1,
      name: 'J’agis pour le climat',
      exact: true,
    })
  }

  /** The personalized catalogue's h1. */
  personalizedTitle() {
    return this.page.getByRole('heading', {
      level: 1,
      name: "Construisez votre plan d'action",
      exact: true,
    })
  }

  /** « Vos 3 actions clés »: the highlighted actions, in rank order. */
  highlightedSection() {
    return this.page.getByRole('region', { name: 'Vos 3 actions clés' })
  }

  highlightedCards() {
    return this.highlightedSection().getByRole('article')
  }

  highlightedCard(title: string) {
    return this.highlightedCards().filter({
      has: this.page.getByRole('heading', { name: title, exact: true }),
    })
  }

  /**
   * The carousel of a theme section, named after the theme title
   * (« Transport », « Alimentation »…). The highlighted actions are listed
   * in their theme section too.
   */
  themeSection(themeTitle: string) {
    return this.page.getByRole('region', { name: themeTitle, exact: true })
  }

  /** A regular card, within the carousel of its theme section. */
  themeCard(themeTitle: string, title: string) {
    return this.themeSection(themeTitle)
      .getByRole('article')
      .filter({
        has: this.page.getByRole('heading', { name: title, exact: true }),
      })
  }

  /** « Voir l'action "<title>" »: the link of a card to its detail page. */
  actionLink(scope: Locator | Page, title: string) {
    return scope.getByRole('link', {
      name: `Voir l'action "${title}"`,
      exact: true,
    })
  }

  /** Commits to the action of a card (highlighted, regular, or a banner). */
  addButton(scope: Locator | Page) {
    return scope.getByRole('button', {
      name: 'Ajouter à mon plan',
      exact: true,
    })
  }

  /** Shown once committed; clicking it again abandons the commitment. */
  addedButton(scope: Locator | Page) {
    return scope.getByRole('button', {
      name: "Ajouté, cliquer à nouveau pour retirer l'action de votre plan",
      exact: true,
    })
  }

  /**
   * « Ma sélection d'actions » (desktop only). The region references its
   * heading by an id the heading does not carry, so it has no accessible
   * name: it is matched by its heading instead.
   */
  basket() {
    return this.page.getByRole('region').filter({
      has: this.page.getByRole('heading', { name: "Ma sélection d'actions" }),
    })
  }

  /** Listed in the catalogue order (impact first), not in the order added. */
  basketItems() {
    return this.basket().getByRole('article')
  }

  basketItem(title: string) {
    return this.basketItems().filter({
      has: this.page.getByRole('heading', { name: title, exact: true }),
    })
  }

  /** The cross of a basket item: abandons the commitment to that action. */
  removeFromBasketButton(title: string) {
    return this.basketItem(title).getByRole('button', {
      name: "Retirer l'action de votre sélection",
      exact: true,
    })
  }

  /**
   * A notification (sonner toast) with that text, newest first: « Ajouté à
   * votre plan d'action », or « Action retirée de votre plan » with its
   * « Annuler » button. They stack and fade out after 5s.
   */
  toast(text: string) {
    return this.page
      .getByRole('region', { name: /^Notifications/ })
      .getByRole('listitem')
      .filter({ hasText: text })
  }

  /**
   * « Sauvegarder mon plan d'action », once the basket holds an action: it
   * leads to the plan page, through the login page for an anonymous visitor.
   */
  savePlanLink() {
    return this.basket().getByRole('link', {
      name: "Sauvegarder mon plan d'action",
      exact: true,
    })
  }

  /**
   * While the basket is empty, saving the plan is a disabled button (its
   * text reads « Sauvegarder mon plan d'action »). It becomes a link once an
   * action is added.
   */
  disabledSavePlanButton() {
    return this.basket().getByRole('button', {
      name: "Sauvegarder mon plan d'actions et accéder à ma page plan d'actions",
      exact: true,
    })
  }

  /** Links between the personalized catalogue and the plan page. */
  exploreActionsLink() {
    return this.page.getByRole('link', {
      name: 'Explorer les actions',
      exact: true,
    })
  }

  /** The tabs of the user space, around the catalogue and the plan page. */
  mySpaceTabs() {
    return this.page.getByRole('navigation', {
      name: 'Navigation de mon espace',
    })
  }

  /**
   * Its count badge (number of actions in the plan) is aria-hidden: it is
   * not part of the name, read it with `toContainText`.
   */
  myPlanLink() {
    return this.page.getByRole('link', {
      name: "Mon plan d'action",
      exact: true,
    })
  }

  /**
   * « En cours de calcul »: what every impact reads while the computation of
   * the simulation is pending or processing (or failed).
   */
  computationInProgress() {
    return this.page.getByRole('main').getByText('En cours de calcul')
  }

  /**
   * The site worker assesses the actions out of band, a couple of seconds
   * after the simulation is completed. Until its computation is completed,
   * the personalized catalogue lists every action, unfiltered, and its
   * impacts read « En cours de calcul »: the highlighted actions alone are no
   * sign of completion, as the assessments are saved before the computation
   * is marked completed. The cache entry of a non-final status expires within
   * seconds: reload until no impact is being computed anymore.
   */
  async waitForAssessments() {
    await expect(async () => {
      if (
        !(await this.highlightedSection().isVisible()) ||
        (await this.computationInProgress().count()) > 0
      ) {
        await this.page.reload()
      }
      await expect(this.highlightedSection()).toBeVisible({ timeout: 2_000 })
      await expect(this.computationInProgress()).toHaveCount(0, {
        timeout: 2_000,
      })
    }).toPass({ timeout: 30_000 })
  }
}
