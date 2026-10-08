import { ExportResultCode, type ExportResult } from '@opentelemetry/core'
import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base'

/** Framework bookkeeping spans to drop: Next module resolution, Prisma
 * compile/serialize. Deterministic list (not a sampler) — parent-child
 * relations stay intact, nothing kept is orphaned. */
const BOOKKEEPING_SPANS = new Set([
  'build component tree',
  'prisma:client:compile',
  'prisma:client:serialize',
  'resolve page components',
  'resolve segment modules',
  'start response',
])

/** Drops bookkeeping spans at export time. An exporter rather than a processor
 * or sampler: processors run per-provider and samplers decide too early. */
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
