import { wireProcessObservability } from '../src/observability/process.ts'

export const { captureException, flushObservability } =
  wireProcessObservability('worker')
