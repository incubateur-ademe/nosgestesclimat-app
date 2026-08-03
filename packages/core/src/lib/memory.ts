import v8 from 'node:v8'

const toMB = (bytes: number): number =>
  Math.round((bytes / (1024 * 1024)) * 100) / 100

/**
 * Memory snapshot of the current process, in MB.
 *
 * `rss` is what the container OOM killer reads, but V8 rarely returns freed
 * pages to the OS, so it plateaus rather than drops when memory is released.
 * `heapUsed` reflects a release sooner, but it also counts garbage not yet
 * collected, so a single before/after delta is noisy - compare across jobs.
 */
export function currentMemoryMB(): {
  rssMB: number
  heapUsedMB: number
  heapTotalMB: number
  externalMB: number
} {
  const { rss, heapUsed, heapTotal, external } = process.memoryUsage()
  return {
    rssMB: toMB(rss),
    heapUsedMB: toMB(heapUsed),
    heapTotalMB: toMB(heapTotal),
    externalMB: toMB(external),
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
