import v8 from 'node:v8'
import type { OtelAttributes } from '../features/logger/index.ts'

const toMB = (bytes: number): number =>
  Math.round((bytes / (1024 * 1024)) * 100) / 100

/** Process memory under OTel semconv names. `process.memory.usage` plateaus
 * (V8 rarely returns pages to OS); `v8js.memory.heap.used` reflects releases
 * sooner. Compare heap across jobs, not around one. */
export function memoryAttributes(): Pick<
  OtelAttributes,
  'process.memory.usage' | 'v8js.memory.heap.used'
> {
  const { rss, heapUsed } = process.memoryUsage()

  return {
    'process.memory.usage': rss,
    'v8js.memory.heap.used': heapUsed,
  }
}

/** V8 old-space ceiling. If above the container limit, the kernel OOM-kills
 * before V8 pressures itself. Log once at startup to verify. */
export function heapSizeLimitMB(): number {
  return toMB(v8.getHeapStatistics().heap_size_limit)
}
