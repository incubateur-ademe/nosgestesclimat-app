import { carboneMetric, eauMetric } from '@/constants/model/metric'
import { sortParticipantsByFootprint } from '@/helpers/groups/sortParticipantsByFootprint'
import type { Participant } from '@/types/groups'

const createParticipant = ({
  id,
  footprints,
}: {
  id: string
  /** Omit a metric to mimic a simulation persisted before it existed */
  footprints: Partial<Record<typeof carboneMetric | typeof eauMetric, number>>
}) =>
  ({
    id,
    name: id,
    simulation: {
      status: 'full_result_seen',
      computedResults: Object.fromEntries(
        Object.entries(footprints).map(([metric, bilan]) => [metric, { bilan }])
      ),
    },
  }) as unknown as Participant

describe('sortParticipantsByFootprint', () => {
  describe('given participants with distinct footprints', () => {
    const participants = [
      createParticipant({ id: 'heavy', footprints: { carbone: 12000 } }),
      createParticipant({ id: 'light', footprints: { carbone: 3000 } }),
      createParticipant({ id: 'medium', footprints: { carbone: 7000 } }),
    ]

    it('then it should order them from the lightest to the heaviest', () => {
      expect(
        sortParticipantsByFootprint(participants, carboneMetric).map(
          ({ id }) => id
        )
      ).toEqual(['light', 'medium', 'heavy'])
    })

    it('then it should leave the given array untouched', () => {
      const incomingOrder = participants.map(({ id }) => id)

      sortParticipantsByFootprint(participants, carboneMetric)

      expect(participants.map(({ id }) => id)).toEqual(incomingOrder)
    })

    it('then it should order them again by the metric it is given', () => {
      const [lightestOnWater] = sortParticipantsByFootprint(
        [
          createParticipant({ id: 'a', footprints: { carbone: 1, eau: 900 } }),
          createParticipant({ id: 'b', footprints: { carbone: 2, eau: 100 } }),
        ],
        eauMetric
      )

      expect(lightestOnWater.id).toBe('b')
    })
  })

  describe('given participants sharing the same footprint', () => {
    const participants = [
      createParticipant({ id: 'first', footprints: { carbone: 5000 } }),
      createParticipant({ id: 'second', footprints: { carbone: 5000 } }),
      createParticipant({ id: 'third', footprints: { carbone: 5000 } }),
    ]

    it('then it should keep their incoming order', () => {
      expect(
        sortParticipantsByFootprint(participants, carboneMetric).map(
          ({ id }) => id
        )
      ).toEqual(['first', 'second', 'third'])
    })

    it('then it should order them the same way whichever order they come in', () => {
      const reversed = [...participants].reverse()

      expect(
        sortParticipantsByFootprint(reversed, carboneMetric).map(({ id }) => id)
      ).toEqual(['third', 'second', 'first'])
    })
  })

  describe('given a participant without a footprint for the metric', () => {
    const participants = [
      createParticipant({ id: 'without', footprints: {} }),
      createParticipant({ id: 'heavy', footprints: { carbone: 12000 } }),
      createParticipant({ id: 'light', footprints: { carbone: 3000 } }),
    ]

    it('then it should push them last, behind every ranked participant', () => {
      expect(
        sortParticipantsByFootprint(participants, carboneMetric).map(
          ({ id }) => id
        )
      ).toEqual(['light', 'heavy', 'without'])
    })
  })

  describe('given no participant has a footprint for the metric', () => {
    const participants = [
      createParticipant({ id: 'first', footprints: { carbone: 3000 } }),
      createParticipant({ id: 'second', footprints: { carbone: 12000 } }),
    ]

    it('then it should keep their incoming order', () => {
      expect(
        sortParticipantsByFootprint(participants, eauMetric).map(({ id }) => id)
      ).toEqual(['first', 'second'])
    })
  })
})
