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

    runSideEffect({ logger, backgroundTaskRunner }, 'joinedEmail', () =>
      Promise.resolve(success())
    )
    await settle()

    // The test logger has no span: the scope it is handed for one is the
    // contract under test here.
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

    runSideEffect({ logger, backgroundTaskRunner }, 'joinedEmail', run)

    expect(run).not.toHaveBeenCalled()
    expect(backgroundTaskRunner).toHaveBeenCalledWith(expect.any(Function))
  })

  it('logs a failed side effect under its name and its call context', async () => {
    const { logger, backgroundTaskRunner, settle } = setup()
    const error = new TestSideEffectError()

    runSideEffect(
      { logger, backgroundTaskRunner },
      'joinedEmail',
      () => Promise.resolve(failure(error)),
      { pollId: 'poll-1', simulationId: 'sim-1' }
    )
    await settle()

    expect(logger.error).toHaveBeenCalledWith(error, {
      sideEffect: 'joinedEmail',
      pollId: 'poll-1',
      simulationId: 'sim-1',
    })
  })

  it('keeps a failure from undoing the work that triggered it', async () => {
    const { logger, backgroundTaskRunner, settle } = setup()

    runSideEffect({ logger, backgroundTaskRunner }, 'joinedEmail', () =>
      Promise.reject(new Error('brevo is down'))
    )

    // The task resolves: what it reports is a line, not a rejection.
    await expect(settle()).resolves.toEqual([undefined])
    expect(logger.error).toHaveBeenCalledWith(expect.any(Error), {
      sideEffect: 'joinedEmail',
    })
  })
})
