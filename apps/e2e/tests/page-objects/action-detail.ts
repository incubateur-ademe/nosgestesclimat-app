import type { Page } from '@playwright/test'

/**
 * The detail page of an action (/actions/<themeSlug>/<slug>?from=…).
 * Personalized to the visitor's last finished simulation when there is one:
 * impact block, commitment banner, and assessed cross-sell cards.
 *
 * The site has no test ids there: the locators rely on accessible roles and
 * names.
 */
export class ActionDetail {
  constructor(public readonly page: Page) {}

  /** « ← Retour »: back to the page named by the `from` search param. */
  goBackLink() {
    return this.page.getByRole('link', { name: '← Retour', exact: true })
  }

  /**
   * The page header: theme, title (h1) and, when the impact is numeric, the
   * « Réduction max sur votre empreinte » block. Not a landmark (it sits in
   * main), hence the tag.
   */
  header() {
    return this.page.getByRole('main').locator('header')
  }

  title() {
    return this.page.getByRole('heading', { level: 1 })
  }

  /**
   * « Je comprends l'enjeu »: the only content section every action has
   * (« J'agis », « J'y gagne » and « À découvrir aussi » are optional).
   */
  understandSection() {
    return this.page.locator('section').filter({
      has: this.page.getByRole('heading', {
        level: 2,
        name: "Je comprends l'enjeu",
        exact: true,
      }),
    })
  }

  /**
   * « Découvrez d'autres actions pour réduire votre empreinte »: the carousel
   * of the other actions of the same theme. Its cards carry their own
   * « Ajouter à mon plan » buttons.
   */
  otherThemeActionsSection() {
    return this.page.getByRole('region', {
      name: 'Découvrez d’autres actions pour réduire votre empreinte',
      exact: true,
    })
  }

  otherThemeActionCards() {
    return this.otherThemeActionsSection().getByRole('article')
  }

  otherThemeActionCard(title: string) {
    return this.otherThemeActionCards().filter({
      has: this.page.getByRole('heading', { name: title, exact: true }),
    })
  }

  /**
   * The bottom banner's commit button. Only rendered when the action is
   * assessed for the visitor. The cross-sell cards have buttons of the same
   * name, after it in the page.
   */
  commitmentButton() {
    return this.page
      .getByRole('button', { name: 'Ajouter à mon plan', exact: true })
      .first()
  }

  /**
   * The bottom banner's button once committed (« Ajouté »): clicking it again
   * abandons the commitment. Like `commitmentButton()`, the first one on the
   * page.
   */
  committedButton() {
    return this.page
      .getByRole('button', {
        name: "Ajouté, cliquer à nouveau pour retirer l'action de votre plan",
        exact: true,
      })
      .first()
  }
}
