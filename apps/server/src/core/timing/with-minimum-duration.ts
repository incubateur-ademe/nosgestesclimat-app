/**
 * Runs `task` but never resolves (or rejects) faster than `minMs`, plus up to
 * `jitterMs` of random padding. Neutralises timing side-channels where a fast
 * code path would otherwise be observable (e.g. user enumeration through
 * response-time differences). Padding is applied in `finally`, so the success
 * and error paths are indistinguishable in duration.
 */
export const withMinimumDuration = async <T>(
  { minMs, jitterMs = 0 }: { minMs: number; jitterMs?: number },
  task: () => Promise<T>
): Promise<T> => {
  const start = Date.now()
  try {
    return await task()
  } finally {
    const target = minMs + Math.floor(Math.random() * (jitterMs + 1))
    const remaining = target - (Date.now() - start)
    if (remaining > 0) {
      await sleep(remaining)
    }
  }
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))
