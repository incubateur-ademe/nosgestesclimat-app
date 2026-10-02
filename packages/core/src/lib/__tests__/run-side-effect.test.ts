import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createTestLogger } from '../../test-utils/logger.ts'
import { DomainError } from '../errors.ts'
import { failure, success } from '../result.ts'
import { runSideEffect } from '../run-side-effect.ts'

class TestSideEffectError extends DomainError<'test_side_effect_error'> {
  constructor() {
    super('test_side_effect_error', 'Side effect failed')
  }
}

describe('runSideEffect', () => {
  const setup = () => {
    const logger = createTestLogger()
    const tasks: Promise<void>[] = []
    const backgroundTaskRunner = vi.fn((task: () => Promise<void>) => {
      tasks.push(task())
    })

    return {
      logger,
      backgroundTaskRunner,
      settle: () => Promise.all(tasks),
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('runs the work in the span of the side effect', async () => {
    const { logger, backgroundTaskRunner, settle } = setup()

    runSideEffect('joinedEmail', { logger, backgroundTaskRunner }, () =>
      Promise.resolve(success())
    )
    await settle()

    // The test logger has no span: all we can assert is the scope the work is
    // handed.
    expect(logger.child).toHaveBeenCalledWith({
      scope: 'core.sideEffect.joinedEmail',
    })
  })

  it('hands the work to the runner instead of starting it', () => {
    // A runner that starts nothing, like `after()` outside a request: the work
    // is the runner's to start, not the call site's.
    const backgroundTaskRunner = vi.fn()
    const logger = createTestLogger()
    const run = vi.fn(() => Promise.resolve(success()))

    runSideEffect('joinedEmail', { logger, backgroundTaskRunner }, run)

    expect(run).not.toHaveBeenCalled()
    expect(backgroundTaskRunner).toHaveBeenCalledWith(expect.any(Function))
  })

  it('hands the span logger to the work and reports through it', async () => {
    const { logger, backgroundTaskRunner, settle } = setup()
    const error = new TestSideEffectError()
    const run = vi.fn(() => Promise.resolve(failure(error)))

    runSideEffect('joinedEmail', { logger, backgroundTaskRunner }, run)
    await settle()

    // `child` returns the same spied instance, so the logger handed to the
    // work is the one the assertion reads.
    expect(run).toHaveBeenCalledWith(logger)
    expect(logger.error).toHaveBeenCalledWith(error)
  })

  it('keeps a failure from undoing the work that triggered it', async () => {
    const { logger, backgroundTaskRunner, settle } = setup()

    runSideEffect('joinedEmail', { logger, backgroundTaskRunner }, () =>
      Promise.reject(new Error('brevo is down'))
    )

    // The task resolves: what it reports is a line, not a rejection.
    await expect(settle()).resolves.toEqual([undefined])
    expect(logger.error).toHaveBeenCalledWith(expect.any(Error))
  })
})
