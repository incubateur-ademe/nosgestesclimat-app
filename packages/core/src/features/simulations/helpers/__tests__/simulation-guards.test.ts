import { describe, expect, it } from 'vitest'
import type { SimulationStatus } from '../../../../prisma/generated/client.ts'
import { isSimulationCompleted } from '../simulation-guards.ts'

const completion = (status: SimulationStatus) =>
  isSimulationCompleted({ status })

describe('isSimulationCompleted', () => {
  it.each([['full_result_seen']] as const)(
    'is completed once the full result is seen (%s)',
    (status) => {
      expect(completion(status)).toBe(true)
    }
  )

  it.each([['not_started'], ['answering_major_questions']] as const)(
    'is not completed while the test is being answered (%s)',
    (status) => {
      expect(completion(status)).toBe(false)
    }
  )
})
