import { initProcessObservability } from '../src/observability/process.ts'
import { reportStartupFailures } from '../src/observability/startup-failure.ts'

// Before the wiring below reads the environment, which is what may fail here.
reportStartupFailures('cron')

initProcessObservability('cron')

export {
  captureException,
  flushObservability,
} from '../src/observability/process.ts'
