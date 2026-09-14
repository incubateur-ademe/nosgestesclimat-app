import { test } from '../fixtures'
import { expectNoBrokenImages } from '../helpers/images'

test("la page d'accueil ne charge aucune image en erreur", async ({ page }) => {
  await expectNoBrokenImages(page, '/')
})
