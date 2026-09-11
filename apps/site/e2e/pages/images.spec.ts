import { test } from '@playwright/test'
import { expectNoBrokenImages } from '../helpers/images'

test("la page d'accueil ne charge aucune image en erreur", async ({ page }) => {
  await expectNoBrokenImages(page, '/')
})
