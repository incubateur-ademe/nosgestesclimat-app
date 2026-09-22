import v8 from 'node:v8'

const toMB = (bytes: number): number =>
  Math.round((bytes / (1024 * 1024)) * 100) / 100

/**
 * The process memory, under the names and the unit (`By`) the semantic
 * conventions define for it: a standard name in a log line survives the move
 * to a real metric, a house one does not.
 *
 * `process.memory.usage` is what the container OOM killer reads, but V8 rarely
 * returns freed pages to the OS, so it plateaus rather than drops when memory
 * is released. `v8js.memory.heap.used` reflects a release sooner, but it also
 * counts garbage not yet collected: compare across jobs, not around a single
 * one. The committed heap size and the external memory have no standard name,
 * and nothing reads them.
 */
export function memoryAttributes(): Record<string, number> {
  const { rss, heapUsed } = process.memoryUsage()

  return {
    'process.memory.usage': rss,
    'v8js.memory.heap.used': heapUsed,
  }
}

/**
 * Ceiling V8 grows the old space to before it throws. Node derives it from the
 * cgroup limit when it can detect one, and from host RAM when it cannot - if it
 * sits above the container limit, the kernel kills the process before V8 ever
 * feels enough pressure to run a major GC. Log it once at startup to check.
 */
export function heapSizeLimitMB(): number {
  return toMB(v8.getHeapStatistics().heap_size_limit)
}
