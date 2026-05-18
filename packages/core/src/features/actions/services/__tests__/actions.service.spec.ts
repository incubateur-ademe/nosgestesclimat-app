import { describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { getActions } from '../actions.service.ts'

describe('ActionsService', () => {
  describe('getActions', () => {
    it('should connect to database and return actions', async () => {
      // Smoke test: verify db connection works
      const count = await prisma.action.count()
      expect(count).toBeTypeOf('number')

      // Test getActions returns an array
      const actions = await getActions()
      expect(Array.isArray(actions)).toBe(true)
    })
  })
})
