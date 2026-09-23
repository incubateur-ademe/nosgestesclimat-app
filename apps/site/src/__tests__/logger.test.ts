// @vitest-environment node
import { DomainError } from '@nosgestesclimat/core/lib/errors'
import type { Mock } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createLogger } from '../logger'

class TestDomainError extends DomainError<'test_domain_error'> {
  constructor() {
    super('test_domain_error', 'Domain failure')
  }
}

describe('createLogger', () => {
  let lines: string[]
  let onCapture: Mock<(error: Error) => void>
  let logger: ReturnType<typeof createLogger>

  beforeEach(() => {
    lines = []
    onCapture = vi.fn<(error: Error) => void>()
    // Pino writes to stdout synchronously: spying on it keeps the assertions on
    // the real serialized line rather than on an intermediate representation.
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
      lines.push(String(chunk))

      return true
    })

    logger = createLogger({
      service: 'site',
      level: 'debug',
      pretty: false,
      onCapture,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const lastLine = () => JSON.parse(lines.at(-1)!) as Record<string, unknown>

  it('tags every line with the service', () => {
    logger.info('hello')

    expect(lastLine().service).toBe('site')
    expect(lastLine().message).toBe('hello')
  })

  it('captures a DomainError', () => {
    const error = new TestDomainError()

    logger.error(error)

    expect(onCapture).toHaveBeenCalledWith(error)
  })

  it('flattens a nested meta into dotted keys, the shape of the export', () => {
    logger.info('engine built', { payload: { key: 'FR:current' } })

    // One shape for both outputs: what stdout prints is what PostHog stores.
    expect(lastLine()['ngc.payload.key']).toBe('FR:current')
    expect(lastLine()['ngc.payload']).toBeUndefined()
  })

  it('writes an Error found in the meta as its messages, not as an empty object', () => {
    logger.info('email rejected', { cause: new Error('425 too many attempts') })

    expect(lastLine()['ngc.cause']).toEqual(
      expect.stringContaining('Error: 425 too many attempts')
    )
  })

  it('logs a warned Error without capturing it', () => {
    logger.warn(new Error('brevo is down'), { attempt: 2 })

    const line = lastLine()
    expect(line.level).toBe(40)
    expect(line['ngc.attempt']).toBe(2)
    expect(onCapture).not.toHaveBeenCalled()
  })

  it('leaves the ids out when no span is active', () => {
    logger.info('worker bootstrap')

    expect(lastLine().trace_id).toBeUndefined()
    expect(lastLine().span_id).toBeUndefined()
  })

  it('skips the capture when explicitly disabled on an error', () => {
    logger.error(new Error('already reported'), undefined, { capture: false })

    expect(onCapture).not.toHaveBeenCalled()
  })

  it('merges child bindings into every following line', () => {
    const jobLogger = logger.child({ job: 'simulation-computation' })

    jobLogger.info('processing')
    jobLogger.info('done')

    expect(JSON.parse(lines[0])['ngc.job']).toBe('simulation-computation')
    expect(lastLine()['ngc.job']).toBe('simulation-computation')
  })

  it('leaves a business payload alone', () => {
    logger.info('answers', { 'ngc.payload': { car: 1 } })

    expect(lastLine()['ngc.payload.car']).toBe(1)
  })
})
