import { createPage } from '../fixtures'
import { Organisation } from '../page-objects/organisation'
import { Poll } from '../page-objects/poll'
import { expect, test } from './fixtures'
import { createOrganisationFromHome, createPollFromHome } from './helpers'

test('creates an organisation from the home page', async ({ page }) => {
  const { admin, slug } = await createOrganisationFromHome(page)

  await page.goto(Organisation.url(slug))

  await expect(
    page.getByRole('heading', {
      name: `Bienvenue ${admin.firstName} ${admin.lastName}`,
      level: 1,
    })
  ).toBeVisible()
})

test('creates an organisation from the home page, then a poll, and shares its link', async ({
  page,
  browser,
}) => {
  const { organisation, poll } = await createPollFromHome(page)

  await expect(page).toHaveURL(Poll.url(organisation.slug, poll.slug))
  await expect(
    page.getByRole('heading', { name: poll.name, level: 1, exact: true })
  ).toBeVisible()

  // The person receiving the link: another browser context, not signed in.
  const invitedPage = await createPage(browser)
  await invitedPage.goto(poll.inviteLink)
  await expect(invitedPage).toHaveURL(/\/simulateur\/campagne\//)
  await expect(invitedPage.getByText(organisation.name)).toBeVisible()
  await invitedPage.close()
})
