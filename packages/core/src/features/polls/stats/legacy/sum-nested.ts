/**
 * Ported from the legacy server (apps/server/src/core/deep-merge.ts).
 * Does not meet core quality standards and will be replaced by an
 * engine-based evaluation in Phase 2.
 */
type RecordToDeepMerge = {
  [key: string]: number | RecordToDeepMerge | undefined
}

const deepMerge = (
  record1: RecordToDeepMerge,
  record2: RecordToDeepMerge,
  operation: (value1: number, value2: number) => number
) =>
  Object.entries(record2).reduce(
    (acc, [key, value]): RecordToDeepMerge => {
      if (typeof value === 'number') {
        acc[key] = acc[key] || 0
        if (typeof acc[key] === 'number') {
          acc[key] = operation(acc[key], value)
        }
      } else if (typeof value === 'object') {
        acc[key] = acc[key] || {}
        if (typeof acc[key] === 'object') {
          acc[key] = deepMerge(acc[key], value, operation)
        }
      }

      return acc
    },
    { ...record1 }
  )

export const sumNested = (
  record1: RecordToDeepMerge,
  record2: RecordToDeepMerge
) => deepMerge(record1, record2, (a, b) => a + b)
