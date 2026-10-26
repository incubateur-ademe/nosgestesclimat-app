import { expectNoBrokenImages } from '../../helpers/images'
import { test } from '../fixtures'

test("la page d'accueil ne charge aucune image en erreur", async ({ page }) => {
  await expectNoBrokenImages(page, '/')
})
