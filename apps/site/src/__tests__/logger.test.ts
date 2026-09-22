// @vitest-environment node
import { Exception } from '@nosgestesclimat/core/exception'
import { DomainError } from '@nosgestesclimat/core/lib/errors'
import type { Mock } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createLogger } from '../logger'

class TestDomainError extends DomainError<'test_domain_error'> {
  constructor() {
    super('test_domain_error', 'Domain failure')
  }
}

class TestException extends Exception<{ actionId: string }> {}

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

  it('writes a DomainError as exception attributes, with its code, and captures it', () => {
    const error = new TestDomainError()

    logger.error(error)

    expect(lastLine()).toMatchObject({
      'exception.type': 'TestDomainError',
      'exception.message': 'Domain failure',
      'exception.stacktrace': expect.any(String),
      code: 'test_domain_error',
    })
    expect(onCapture).toHaveBeenCalledWith(error)
  })

  it('writes an Exception with its declared level and its payload', () => {
    logger.error(new TestException({ message: 'No rule', actionId: 'a1' }))

    expect(lastLine()).toMatchObject({
      'exception.type': 'TestException',
      'exception.message': 'No rule',
      'level.domain': 'error',
      'payload.actionId': 'a1',
    })
  })

  it('appends the cause chain to the stacktrace', () => {
    logger.error(new Error('boom', { cause: new Error('root') }))

    expect(lastLine()['exception.stacktrace']).toContain(
      'Caused by: Error: root'
    )
  })

  it('flattens a nested meta into dotted keys', () => {
    logger.info('engine built', { engine: { key: 'FR:current' } })

    expect(lastLine()['engine.key']).toBe('FR:current')
    expect(lastLine().engine).toBeUndefined()
  })

  it('logs a warned Error with its stack, without capturing it', () => {
    logger.warn(new Error('brevo is down'), { attempt: 2 })

    const line = lastLine()
    expect(line.level).toBe(40)
    expect(line.attempt).toBe(2)
    expect(line['exception.stacktrace']).toEqual(expect.any(String))
    expect(onCapture).not.toHaveBeenCalled()
  })

  it('does not capture below error, even when asked to', () => {
    // A message alone carries no stack: there is nothing worth reporting.
    logger.warn('degraded', undefined, { capture: true })
    logger.info('hello')
    logger.debug('hello')

    expect(onCapture).not.toHaveBeenCalled()
  })

  it('skips the capture when explicitly disabled on an error', () => {
    logger.error(new Error('already reported'), undefined, { capture: false })

    expect(onCapture).not.toHaveBeenCalled()
  })

  it('merges child bindings into every following line', () => {
    logger.child({ job: 'simulation-computation' }).info('processing')

    expect(lastLine().job).toBe('simulation-computation')
  })

  it('redacts the personal data a caller should not have logged', () => {
    logger.info('contact', { email: 'a@b.com', token: 'secret' })

    const line = lastLine()
    expect(line.email).toBe('[redacted]')
    expect(line.token).toBe('[redacted]')
  })

  it('leaves a business payload alone', () => {
    // The answers are not PII: masking them would hide what the line is about.
    logger.info('answers', { answers: { car: 1 } })

    expect(lastLine()['answers.car']).toBe(1)
  })
})
