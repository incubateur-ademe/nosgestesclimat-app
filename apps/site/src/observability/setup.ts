import { trace, type Tracer } from '@opentelemetry/api'
import { logs } from '@opentelemetry/api-logs'
import {
  CompositePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from '@opentelemetry/sdk-logs'
import {
  BatchSpanProcessor,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { PrismaInstrumentation } from '@prisma/instrumentation'

import { APP_ENV } from '../env/app-env.ts'
import { IdentitySpanProcessor } from './request-identity.ts'
import { FilteringSpanExporter } from './span-filter.ts'
import { isStaticRequest } from './static-request.ts'
import { XRequestIdPropagator } from './x-request-id-propagator.ts'

let tracerProvider: NodeTracerProvider | undefined
let loggerProvider: LoggerProvider | undefined
let initialized = false

/**
 * Where the exporters post, and what they authenticate with: the endpoint is
 * the region of the project the token belongs to, and neither is guessed.
 */
interface OtlpConfig {
  /** Where the exporters post. */
  endpoint: string
  /** Bearer token of the PostHog project. */
  token: string
}

/** Wires OTel: traces + logs exported to PostHog. Called before any
 * instrumented module is imported; skipped when there is no config (nothing
 * would be exported). */
export function initObservability(
  service: string,
  sourceVersion: string | undefined,
  otlp: OtlpConfig
): void {
  if (initialized) {
    return
  }
  initialized = true

  const authorization = { Authorization: `Bearer ${otlp.token}` }

  const resource = resourceFromAttributes({
    // The product, then the process that produced the telemetry: `web-server`
    // and `worker` are two services of the same application.
    'service.namespace': 'nosgestesclimat',
    'service.name': service,
    // `deployment.environment.name` is the key behind PostHog Logs'
    // Environment facet, and its value matches what the nginx collector sends
    // (`production`, `preprod`): one filter then covers the three runtimes.
    'deployment.environment.name': APP_ENV,
    // One release everywhere: the deployed commit SHA, the same string as the
    // Sentry release and the browser `serviceVersion`. No env suffix — the
    // environment has its own key. Absent in local dev, which deploys nothing:
    // a stale value would be worse than none.
    ...(sourceVersion ? { 'service.version': sourceVersion } : {}),
  })

  const spanProcessors: SpanProcessor[] = [
    new IdentitySpanProcessor(),
    new BatchSpanProcessor(
      // The framework's bookkeeping is dropped here, where it would leave
      // the process: everything above this line still sees the whole trace.
      new FilteringSpanExporter(
        new OTLPTraceExporter({
          url: `${otlp.endpoint}/v1/traces`,
          headers: authorization,
        })
      )
    ),
  ]

  loggerProvider = new LoggerProvider({
    resource,
    processors: [
      new BatchLogRecordProcessor({
        exporter: new OTLPLogExporter({
          url: `${otlp.endpoint}/v1/logs`,
          headers: authorization,
        }),
      }),
    ],
  })
  logs.setGlobalLoggerProvider(loggerProvider)

  // No sampler: every trace is exported, so a line always points to a trace
  // that exists. `LOG_LEVEL` is the volume lever; reintroducing a sampler means
  // a `ParentBasedSampler`, plus a look at the propagator's `SAMPLED` flag.
  tracerProvider = new NodeTracerProvider({
    resource,
    spanProcessors,
  })

  tracerProvider.register({
    propagator: new CompositePropagator({
      propagators: [
        new W3CTraceContextPropagator(),
        new XRequestIdPropagator(),
      ],
    }),
  })

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation({
        // A file is not an operation: no span for the assets Next serves, the
        // CMS media, the favicon — `isStaticRequest` holds the list.
        ignoreIncomingRequestHook: (request) => isStaticRequest(request.url),
      }),
      new PrismaInstrumentation(),
    ],
  })
}

/** The tracer of this process. The service is on the resource (`service.name`),
 * the scope name is the application's — same process graph, one name. */
export function appTracer(): Tracer {
  return trace.getTracer('ngc')
}

/** Exports what is buffered. Called on shutdown and before a fatal exit. */
export async function shutdownObservability(): Promise<void> {
  await Promise.allSettled([
    tracerProvider?.shutdown(),
    loggerProvider?.shutdown(),
  ])
  // Nothing else to close: a processor drops what is emitted after its own
  // `shutdown()`, so late lines stay stdout-only without the bridge knowing.
}
