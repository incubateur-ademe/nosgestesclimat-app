import { describe, expect, it } from 'vitest'
import {
  getCollectiveTestStepNumber,
  getCollectiveTestTotalSteps,
} from '../collectiveTestFlow'

describe('collectiveTestFlow', () => {
  describe('getCollectiveTestTotalSteps', () => {
    it('returns 4 steps for a non-authenticated user', () => {
      expect(getCollectiveTestTotalSteps(false, false)).toBe(4)
    })

    it('returns 3 steps for an authenticated user without an organisation', () => {
      expect(getCollectiveTestTotalSteps(true, false)).toBe(3)
    })

    it('returns 2 steps for an authenticated user who already has an organisation', () => {
      expect(getCollectiveTestTotalSteps(true, true)).toBe(2)
    })
  })

  describe('getCollectiveTestStepNumber', () => {
    it('numbers the informations step as 1 in every scenario', () => {
      expect(getCollectiveTestStepNumber('informations', false, false)).toBe(1)
      expect(getCollectiveTestStepNumber('informations', true, false)).toBe(1)
      expect(getCollectiveTestStepNumber('informations', true, true)).toBe(1)
    })

    it('numbers the mode step as 2 in every scenario', () => {
      expect(getCollectiveTestStepNumber('mode', false, false)).toBe(2)
      expect(getCollectiveTestStepNumber('mode', true, false)).toBe(2)
      expect(getCollectiveTestStepNumber('mode', true, true)).toBe(2)
    })

    it('numbers the connexion step as 3 for a non-authenticated user', () => {
      expect(getCollectiveTestStepNumber('connexion', false, false)).toBe(3)
    })

    it('numbers the organisation step as 4 for a non-authenticated user', () => {
      expect(getCollectiveTestStepNumber('organisation', false, false)).toBe(4)
    })

    it('numbers the organisation step as 3 for an authenticated user without an organisation', () => {
      expect(getCollectiveTestStepNumber('organisation', true, false)).toBe(3)
    })
  })
})
