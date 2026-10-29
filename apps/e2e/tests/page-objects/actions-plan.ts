import type { Page } from '@playwright/test'

/**
 * The plan page (/actions/mon-plan): the actions the user committed to,
 * grouped by theme. Verified users only: an anonymous visitor is redirected
 * to the login page (/connexion?from=build-action-plan).
 *
 * The site has no test ids there: the locators rely on accessible roles and
 * names. Tiles are matched by their exact title (heading).
 */
export class ActionsPlan {
  static URL = '/actions/mon-plan'

  constructor(public readonly page: Page) {}

  title() {
    return this.page.getByRole('heading', {
      level: 1,
      name: 'Mon plan d’action',
      exact: true,
    })
  }

  /**
   * « Vous avez ajouté N actions à votre plan. » (« 1 action » when single).
   * The count is in a `<strong>`: assert it with `toHaveText`.
   */
  summary() {
    return this.page.getByText(/^Vous avez ajouté/)
  }

  /** The h2 of each theme that has at least one committed action. */
  themeHeadings() {
    return this.page.getByRole('main').getByRole('heading', { level: 2 })
  }

  /** One `article` per committed action, under the h2 of its theme. */
  tiles() {
    return this.page.getByRole('main').getByRole('article')
  }

  tile(title: string) {
    return this.tiles().filter({
      has: this.page.getByRole('heading', { name: title, exact: true }),
    })
  }

  /**
   * The tiles of a theme: a `section` (no accessible name, hence the tag)
   * headed by the theme title (h2, exact match).
   */
  themeSection(themeTitle: string) {
    return this.page
      .getByRole('main')
      .locator('section')
      .filter({
        has: this.page.getByRole('heading', {
          level: 2,
          name: themeTitle,
          exact: true,
        }),
      })
  }

  /** A tile scoped to the section of its theme. */
  themeTile(themeTitle: string, title: string) {
    return this.themeSection(themeTitle)
      .getByRole('article')
      .filter({
        has: this.page.getByRole('heading', { name: title, exact: true }),
      })
  }

  /** « Retirer l’action "<title>" de votre plan », on the tile. */
  removeButton(title: string) {
    return this.tile(title).getByRole('button', {
      name: `Retirer l’action "${title}" de votre plan`,
      exact: true,
    })
  }

  /**
   * « Voir l'action "<title>" »: the tile's link (an overlay on the whole
   * tile) to the detail page, with `?from=mon-plan`.
   */
  detailLink(title: string) {
    return this.tile(title).getByRole('link', {
      name: `Voir l'action "${title}"`,
      exact: true,
    })
  }

  /** « Explorer d’autres actions », below the tiles: back to the catalogue. */
  exploreOtherActionsLink() {
    return this.page.getByRole('link', {
      name: 'Explorer d’autres actions',
      exact: true,
    })
  }
}
