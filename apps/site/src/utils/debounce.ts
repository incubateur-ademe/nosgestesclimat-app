import { useEffect, useMemo, useRef } from 'react'

interface DebouncedFunction<T extends unknown[]> {
  (...args: T): void
  cancel: () => void
  flush: () => void
}

function debounce<T extends unknown[]>(
  func: (...args: T) => void | Promise<void>,
  wait: number
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let lastArgs: T | null = null

  const debounced = function (...args: T): void {
    lastArgs = args
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }

  debounced.cancel = function (): void {
    if (timeout !== null) {
      clearTimeout(timeout)
      timeout = null
    }
    lastArgs = null
  }

  debounced.flush = function (): void {
    if (timeout !== null) {
      clearTimeout(timeout)
      timeout = null
    }
    if (lastArgs !== null) {
      func(...lastArgs)
      lastArgs = null
    }
  }

  return debounced
}

export function useDebounce<T extends unknown[]>(
  func: (...args: T) => void | Promise<void>,
  wait: number
): DebouncedFunction<T> {
  const funcRef = useRef(func)

  // Update funcRef at each render
  // avoids stale setValue function calls
  useEffect(() => {
    funcRef.current = func
  })

  return useMemo(
    () => debounce((...args: T) => funcRef.current(...args), wait),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
}
