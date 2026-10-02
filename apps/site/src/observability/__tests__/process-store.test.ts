// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { processStore } from '../process-store'

describe('process store', () => {
  it('handles the same value to every copy of a module', async () => {
    const first = processStore('test-shared-value', () => ({ created: 0 }))

    // Two entries of the Next build: the second has its own module registry,
    // so its own copy of the store — and must reach the same value.
    vi.resetModules()
    const { processStore: copyInAnotherEntry } =
      await import('../process-store')
    const second = copyInAnotherEntry('test-shared-value', () => ({
      created: 1,
    }))

    // Guards the test itself: a copy that is not a copy proves nothing.
    expect(copyInAnotherEntry).not.toBe(processStore)
    expect(second).toBe(first)
  })

  it('creates the value once', () => {
    let creations = 0
    const create = () => {
      creations++

      return { creations }
    }

    processStore('test-created-once', create)
    processStore('test-created-once', create)

    expect(creations).toBe(1)
  })
})
