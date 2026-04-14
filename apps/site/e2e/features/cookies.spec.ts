import { expect, test } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Cookie Consent Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should default to "Refuse" in settings when "Refuse All" is clicked on banner', async ({
    page,
  }) => {
    // Refuse all on banner
    await expect(page.getByTestId('cookie-banner-title')).toBeVisible()
    await page.getByTestId('cookie-banner-refuse-button').click()
    await expect(page.getByTestId('cookie-banner-title')).not.toBeVisible()

    // Open settings
    await page.getByTestId('cookie-footer-button').click()
    await expect(page.getByTestId('cookie-management-title')).toBeVisible()

    // Verify defaults
    await expect(page.getByTestId('google-ads-refuse-radio')).toBeChecked()
    await expect(page.getByTestId('posthog-refuse-radio')).toBeChecked()
  })

  test('should default to "Accept" in settings when "Accept All" is clicked on banner', async ({
    page,
  }) => {
    // Accept all on banner
    await expect(page.getByTestId('cookie-banner-title')).toBeVisible()
    await page.getByTestId('cookie-banner-accept-button').click()
    await expect(page.getByTestId('cookie-banner-title')).not.toBeVisible()

    // Open settings
    await page.getByTestId('cookie-footer-button').click()
    await expect(page.getByTestId('cookie-management-title')).toBeVisible()

    // Verify defaults
    await expect(page.getByTestId('google-ads-accept-radio')).toBeChecked()
    await expect(page.getByTestId('posthog-accept-radio')).toBeChecked()
  })

  test('should persist "Accept" choices after page reload', async ({
    page,
  }) => {
    // Accept all on banner
    await expect(page.getByTestId('cookie-banner-title')).toBeVisible()
    await page.getByTestId('cookie-banner-accept-button').click()
    await expect(page.getByTestId('cookie-banner-title')).not.toBeVisible()

    await page.reload()

    // Banner should not reappear
    await expect(page.getByTestId('cookie-banner-title')).not.toBeVisible()

    // Open settings
    await page.getByTestId('cookie-footer-button').click()
    await expect(page.getByTestId('cookie-management-title')).toBeVisible()

    // Verify accept radios are still selected
    await expect(page.getByTestId('google-ads-accept-radio')).toBeChecked()
    await expect(page.getByTestId('posthog-accept-radio')).toBeChecked()
  })

  test('should sync PostHog opt-out from privacy policy checkbox to settings', async ({
    page,
  }) => {
    // Accept all on banner (so PostHog is initially accepted/enabled)
    await page.getByTestId('cookie-banner-accept-button').click()

    // Go to Privacy Policy
    await page.goto('/politique-de-confidentialite')

    // Click check box
    const checkbox = page.getByTestId('posthog-tracking-checkbox')
    await expect(checkbox).toBeChecked()

    await checkbox.uncheck()

    // Open settings
    await page.getByTestId('cookie-footer-button').click()
    await expect(page.getByTestId('cookie-management-title')).toBeVisible()

    // Verify PostHog is "Refused"
    await expect(page.getByTestId('posthog-refuse-radio')).toBeChecked()
  })
})
