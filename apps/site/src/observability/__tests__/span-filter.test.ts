// @vitest-environment node
import { ExportResultCode, type ExportResult } from '@opentelemetry/core'
import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base'
import { describe, expect, it } from 'vitest'

import { FilteringSpanExporter } from '../span-filter'

const named = (name: string) => ({ name }) as ReadableSpan

/** The exporter under it, recording what actually leaves the process. */
function recordingExporter(): {
  batches: string[][]
  exporter: SpanExporter
} {
  const batches: string[][] = []

  return {
    batches,
    exporter: {
      export(spans, resultCallback) {
        batches.push(spans.map((span) => span.name))
        resultCallback({ code: ExportResultCode.SUCCESS })
      },
      shutdown: () => Promise.resolve(),
    },
  }
}

describe('FilteringSpanExporter', () => {
  it('drops the bookkeeping spans and ships the rest of the batch', () => {
    const { batches, exporter } = recordingExporter()

    new FilteringSpanExporter(exporter).export(
      [
        named('resolve page components'),
        named('prisma:client:db_query'),
        named('resolve segment modules'),
        named('RSC GET /[locale]/mon-espace'),
      ],
      () => undefined
    )

    expect(batches).toEqual([
      ['prisma:client:db_query', 'RSC GET /[locale]/mon-espace'],
    ])
  })

  it('reports success without calling the exporter when nothing is left', () => {
    const { batches, exporter } = recordingExporter()
    const results: ExportResult[] = []

    new FilteringSpanExporter(exporter).export(
      [named('start response'), named('build component tree')],
      (result) => results.push(result)
    )

    expect(batches).toEqual([])
    expect(results).toEqual([{ code: ExportResultCode.SUCCESS }])
  })
})
