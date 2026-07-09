import { describe, expect, it } from 'vitest'
import { ForbiddenException } from '../../exceptions/forbidden.exception.ts'
import { assertOwnership } from '../assert-ownership.ts'

describe('assertOwnership', () => {
  it('does not throw when userIds match', () => {
    expect(() => assertOwnership('abc', 'abc')).not.toThrow()
  })

  it('throws ForbiddenException when userIds differ', () => {
    expect(() => assertOwnership('abc', 'xyz')).toThrow(ForbiddenException)
  })

  it('throws ForbiddenException when sessionUserId is undefined', () => {
    expect(() => assertOwnership(undefined, 'abc')).toThrow(ForbiddenException)
  })
})
