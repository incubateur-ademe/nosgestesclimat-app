import { expect, type Page } from '@playwright/test'

/**
 * Vérifie qu'aucune image de la page n'est cassée (404, contenu invalide…).
 *
 * Les médias CMS sont servis sous `/_static/cms/...`, proxyfiés vers S3 par
 * Nginx en prod et par un rewrite Next.js ailleurs (review apps, dev) : une
 * régression de ce proxy renvoie des 404 sans casser le rendu, donc seule
 * l'inspection des images elles-mêmes permet de la détecter.
 */
export async function expectNoBrokenImages(page: Page, path: string) {
  await page.goto(path)

  // Déclenche le chargement des images en lazy-loading.
  for (const image of await page.locator('img:visible').all()) {
    await image.scrollIntoViewIfNeeded()
  }

  // Garde-fou : sans image, le test passerait à vide.
  expect(await page.locator('img').count()).toBeGreaterThan(0)

  // `naturalWidth` reste à 0 quand le navigateur n'a pas pu charger l'image
  // (404, contenu invalide…). `expect.poll` laisse le temps aux chargements
  // et remonte les URLs fautives en cas d'échec.
  await expect
    .poll(() =>
      page
        .locator('img')
        .evaluateAll((images) =>
          (images as HTMLImageElement[])
            .filter((image) => image.complete && image.naturalWidth === 0)
            .map((image) => image.src)
        )
    )
    .toEqual([])
}
