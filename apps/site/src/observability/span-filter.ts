import { ExportResultCode, type ExportResult } from '@opentelemetry/core'
import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base'

/**
 * The spans that measure the framework's own bookkeeping rather than an
 * operation: Next resolving a page's modules, Prisma compiling and serializing
 * around the query it runs. A deterministic list, not a sampler — nothing is
 * dropped by chance, and the spans a reader follows stay whole: the route keeps
 * its render, the query keeps its SQL.
 *
 * The relation to preserve is the parent-child one. Of these, only
 * `build component tree` parents anything, and only `resolve segment modules`,
 * which is dropped with it: the rest are leaves, so nothing kept is orphaned.
 * A new name goes in only with its children — or their absence — checked.
 */
const BOOKKEEPING_SPANS = new Set([
  'build component tree',
  'prisma:client:compile',
  'prisma:client:serialize',
  'resolve page components',
  'resolve segment modules',
  'start response',
])

/**
 * Drops them where they would leave the process. An exporter rather than a
 * span processor: every processor of the provider is called with every span,
 * so one of them decided alone would filter nothing for the batch processor
 * registered beside it — and a sampler would take the decision at span
 * creation, where the list is not known yet.
 */
export class FilteringSpanExporter implements SpanExporter {
  // Written out rather than a parameter property: the worker runs these
  // sources through Node's strip-only TypeScript, which erases types and
  // cannot carry the assignment a parameter property implies.
  private readonly exporter: SpanExporter

  constructor(exporter: SpanExporter) {
    this.exporter = exporter
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    const kept = spans.filter((span) => !BOOKKEEPING_SPANS.has(span.name))

    // Nothing to send is a success: the batch processor reads the callback as
    // the health of the export, and an empty batch is not a failure.
    if (kept.length === 0) {
      resultCallback({ code: ExportResultCode.SUCCESS })

      return
    }

    this.exporter.export(kept, resultCallback)
  }

  shutdown(): Promise<void> {
    return this.exporter.shutdown()
  }

  forceFlush(): Promise<void> {
    return this.exporter.forceFlush?.() ?? Promise.resolve()
  }
}
