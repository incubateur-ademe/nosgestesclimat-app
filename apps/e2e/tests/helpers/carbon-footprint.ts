import type { Page } from '@playwright/test'

/**
 * Get the carbon footprint element from the page
 * @param page - The Playwright page
 * @returns The carbon footprint element
 */
export function getCarbonFootprintElem(page: Page) {
  const carbonFootprintElem = page
    .getByText(/[\d]+,[\d][\s]tonnes/)
    .filter({ visible: true })
    .first()
  return carbonFootprintElem
}
