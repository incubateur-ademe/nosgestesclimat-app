import { describe, expect, it } from 'vitest'
import { invariant, InvariantError } from '../invariant.ts'

describe('invariant', () => {
  it('does not throw when the condition is truthy', () => {
    expect(() => invariant(true, 'nope')).not.toThrow()
    expect(() => invariant(1, 'nope')).not.toThrow()
    expect(() => invariant('a', 'nope')).not.toThrow()
  })

  it('throws an InvariantError when the condition is falsy', () => {
    expect(() => invariant(false)).toThrow(InvariantError)
    expect(() => invariant(0)).toThrow(InvariantError)
    expect(() => invariant(null)).toThrow(InvariantError)
    expect(() => invariant(undefined)).toThrow(InvariantError)
  })

  it('uses the provided string message', () => {
    expect(() => invariant(false, 'user must exist')).toThrow('user must exist')
  })

  it('uses the lazy message function only when the condition fails', () => {
    let called = false
    const lazy = () => {
      called = true
      return 'computed message'
    }

    invariant(true, lazy)
    expect(called).toBe(false)

    expect(() => invariant(false, lazy)).toThrow('computed message')
    expect(called).toBe(true)
  })

  it('falls back to a default message when none is provided', () => {
    expect(() => invariant(false)).toThrow('Invariant violation')
  })

  it('narrows the type of the asserted value', () => {
    const value: string | undefined = 'hello'
    invariant(value, 'value is required')
    // After the assertion, `value` is narrowed to `string`.
    expect(value.length).toBe(5)
  })
})
