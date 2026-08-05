import { describe, expect, it } from 'vitest'
import { redactBody } from './logger.ts'

describe('redactBody', () => {
  it('masks emails, verification codes and session ids in auth payloads', () => {
    const body = redactBody({
      email: 'john.doe@example.com',
      code: '779371',
      userId: '01234567-89ab-cdef-0123-456789abcdef',
    } as Record<string, unknown>)

    expect(body.email).toBe('jo***@ex***')
    expect(body.code).toBe('[REDACTED]')
    expect(body.userId).toBe('01234567***')
    expect(JSON.stringify(body)).not.toContain('779371')
    expect(JSON.stringify(body)).not.toContain('john.doe')
    expect(JSON.stringify(body)).not.toContain('example.com')
  })

  it('leaves simulation redaction intact and handles missing fields', () => {
    const body = redactBody({ situation: { logement: {} } } as Record<
      string,
      unknown
    >)

    expect(body.situation).toBe('[REDACTED]')
    expect(body.email).toBeUndefined()
  })
})
