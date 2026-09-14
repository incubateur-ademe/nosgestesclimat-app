import { test as base, expect } from '@playwright/test'
import { settleBudget, watchHydrationMismatches } from '../helpers/hydration'

/**
 * Watches every test of the suite for hydration mismatches, with nothing to
 * declare per feature: React raises an (uncaught) error whenever the server HTML
 * and the client render disagree, and this fixture reports it for the test whose
 * page saw one. It has to run everywhere rather than in a dedicated spec,
 * because a page is only covered if some test actually loads it.
 *
 * It matters because a mismatch is silent in production: React simply throws the
 * server HTML away and regenerates the tree on the client — the re-render blocks
 * the main thread for seconds, which is what made the suite lose clicks.
 *
 * The mismatch is logged, so it shows up next to the failing assertion, and
 * fails the test: the code base is clean, and a mismatch is a real regression
 * (React throws away the server HTML and re-renders the whole tree on the
 * client). The known causes and the way to triage them are in the
 * `hydration-mismatch-triage` skill.
 */
const test = base.extend<{ hydrationGuard: void }>({
  hydrationGuard: [
    async ({ page }, use) => {
      const mismatches = watchHydrationMismatches(page)

      let loadedAt = 0
      page.on('load', () => {
        loadedAt = Date.now()
      })

      await use()

      // React logs the mismatch shortly *after* the load event, so a test that
      // ends earlier would miss it. Tests that already spent that time
      // interacting (most of them) wait nothing.
      const budget = settleBudget(loadedAt)
      if (budget > 0) {
        // eslint-disable-next-line playwright/no-wait-for-timeout -- see above
        await page.waitForTimeout(budget).catch(() => undefined)
      }

      if (mismatches.length === 0) {
        return
      }

      const summary = mismatches
        .map(({ path, detail }) => `${path} — ${detail}`)
        .join('\n')

      console.warn(
        `Hydration mismatch: React discarded the server HTML and regenerated the tree on the client.\n${summary}`
      )

      expect(mismatches, summary).toEqual([])
    },
    { auto: true },
  ],
})

export { test }
