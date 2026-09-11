import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter'

/**
 * Prints the hydration mismatches collected by the `hydration-guard` fixture at
 * the end of the run, instead of one warning per test (which drowns the output
 * of a suite that visits a hundred pages).
 *
 * They do not fail the tests: a few are still open (see the PR description) and
 * `HYDRATION_GUARD=strict` is what turns them into failures.
 */
export default class HydrationSummaryReporter implements Reporter {
  private readonly byTest = new Map<string, string>()

  onTestEnd(test: TestCase, result: TestResult) {
    for (const annotation of result.annotations) {
      if (annotation.type === 'hydration-mismatch' && annotation.description) {
        this.byTest.set(test.titlePath().join(' › '), annotation.description)
      }
    }
  }

  onEnd() {
    if (this.byTest.size === 0) {
      return
    }

    const lines = [
      `\n=== Hydration mismatches (${this.byTest.size} test(s)) ===`,
    ]

    for (const [title, description] of this.byTest) {
      lines.push(`\n* ${title}`)
      for (const line of description.split('\n').slice(1)) {
        lines.push(`    ${line.slice(0, 400)}`)
      }
    }

    lines.push(
      '\nReact regenerates the entire tree on the client when this happens.',
      'Run with HYDRATION_GUARD=strict to fail on them.\n'
    )

    process.stdout.write(lines.join('\n'))
  }
}
