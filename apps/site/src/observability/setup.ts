import { trace, type Tracer } from '@opentelemetry/api'
import { logs } from '@opentelemetry/api-logs'
import {
  CompositePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
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
  TraceIdRatioBasedSampler,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { PrismaInstrumentation } from '@prisma/instrumentation'

import { APP_ENV } from '../../config/app-env.ts'
import { IdentitySpanProcessor } from './request-identity.ts'
import { XRequestIdPropagator } from './x-request-id-propagator.ts'

/** PostHog ingests OTLP under `/i`, per project region. */
const DEFAULT_OTLP_ENDPOINT = 'https://eu.i.posthog.com/i'

let tracerProvider: NodeTracerProvider | undefined
let loggerProvider: LoggerProvider | undefined
let serviceName = 'site'
let initialized = false

/**
 * Wires the OpenTelemetry SDK: traces are exported to PostHog, the adapter to
 * the framework (`instrumentation-http`), to Prisma and to pino. Sentry keeps
 * the errors only and reads the trace context from this provider
 * (`skipOpenTelemetrySetup`), so one `trace_id` covers the whole request.
 *
 * Called from `register()` (site) or from the worker bootstrap, before any
 * instrumented module is imported.
 */
export function initObservability(service: string): void {
  if (initialized) {
    return
  }
  initialized = true
  serviceName = service

  const endpoint = process.env.POSTHOG_OTLP_ENDPOINT ?? DEFAULT_OTLP_ENDPOINT
  const projectToken = process.env.POSTHOG_PROJECT_TOKEN
  const ratio = Number(process.env.OTEL_TRACES_SAMPLER_RATIO ?? 1)
  const authorization = projectToken
    ? { Authorization: `Bearer ${projectToken}` }
    : undefined

  const resource = resourceFromAttributes({
    // The product, then the process that produced the telemetry: `site` and
    // `worker` are two services of the same application.
    'service.namespace': 'nosgestesclimat',
    'service.name': service,
    // The current semantic convention, and the key PostHog facets on — the
    // nginx collector still emits the deprecated form.
    'deployment.environment.name': APP_ENV,
    // One release everywhere: the deployed commit SHA, the same string as the
    // Sentry release and the browser `serviceVersion`. No env suffix — the
    // environment has its own key. Absent in local dev, which deploys nothing:
    // a stale number is worse than no number.
    ...(process.env.SOURCE_VERSION
      ? { 'service.version': process.env.SOURCE_VERSION }
      : {}),
  })

  const spanProcessors: SpanProcessor[] = [new IdentitySpanProcessor()]

  if (authorization) {
    spanProcessors.push(
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: `${endpoint}/v1/traces`,
          headers: authorization,
        })
      )
    )

    loggerProvider = new LoggerProvider({
      resource,
      processors: [
        new BatchLogRecordProcessor({
          exporter: new OTLPLogExporter({
            url: `${endpoint}/v1/logs`,
            headers: authorization,
          }),
        }),
      ],
    })
    logs.setGlobalLoggerProvider(loggerProvider)
  }

  tracerProvider = new NodeTracerProvider({
    resource,
    spanProcessors,
    // Deterministic per trace id: a sampled request stays sampled for every
    // span it produces, edge id included.
    sampler: ratio < 1 ? new TraceIdRatioBasedSampler(ratio) : undefined,
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
        // Framework assets are not worth a span per file.
        ignoreIncomingRequestHook: (request) =>
          request.url?.startsWith('/_next/') ?? false,
      }),
      new PrismaInstrumentation(),
    ],
  })
}

/** The tracer of this process, named after its service. */
export function appTracer(): Tracer {
  return trace.getTracer(serviceName)
}

/** Exports what is buffered. Called on shutdown and before a fatal exit. */
export async function shutdownObservability(): Promise<void> {
  await Promise.allSettled([
    tracerProvider?.shutdown(),
    loggerProvider?.shutdown(),
  ])
}
