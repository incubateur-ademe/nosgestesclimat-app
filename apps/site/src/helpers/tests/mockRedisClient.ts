import { vi } from 'vitest'

// Mocks the Redis client with the behavior of SET ... NX: the first write of
// a key returns 'OK' and repeats return null. Keys persist across the tests
// of a file, like a real Redis would, so tests hitting the same key must use
// distinct values.
export function mockRedisClient() {
  const storedKeys = new Set<string>()

  return {
    set: vi.fn((key: string) => {
      if (storedKeys.has(key)) {
        return null
      }
      storedKeys.add(key)

      return 'OK'
    }),
  }
}
