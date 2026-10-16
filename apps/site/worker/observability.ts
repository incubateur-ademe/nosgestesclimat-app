import { initProcessObservability } from '../src/observability/process.ts'
import { reportStartupFailures } from '../src/observability/startup-failure.ts'

// Before the wiring below reads the environment, which is what may fail here.
reportStartupFailures('worker')

initProcessObservability('worker')

export {
  captureException,
  flushObservability,
} from '../src/observability/process.ts'
