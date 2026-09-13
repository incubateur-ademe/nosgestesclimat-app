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
 * Mismatches are logged, so they show up in the test output like any other
 * error, and do not fail the tests: a few are still open (see the
 * `hydration-mismatch-triage` skill). Set `HYDRATION_GUARD=strict` to make them
 * fail — that is how to check that the code base is clean again.
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

      if (process.env.HYDRATION_GUARD === 'strict') {
        expect(mismatches, summary).toEqual([])
      }
    },
    { auto: true },
  ],
})

export { test }
