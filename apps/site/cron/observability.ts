import { initProcessObservability } from '../src/observability/process.ts'

// Registered before the core services are imported, which is before Prisma is
// instantiated: that is what lets the queries be traced.
initProcessObservability('cron')

export {
  captureException,
  flushObservability,
} from '../src/observability/process.ts'
