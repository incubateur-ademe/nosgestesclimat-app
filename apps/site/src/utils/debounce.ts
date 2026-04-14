import { useMemo } from 'react'

interface DebouncedFunction<T extends unknown[]> {
  (...args: T): void
  cancel: () => void
}

function debounce<T extends unknown[]>(
  func: (...args: T) => void | Promise<void>,
  wait: number
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null

  const debounced = function (...args: T): void {
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
  }

  return debounced
}

export function useDebounce<T extends unknown[]>(
  func: (...args: T) => void | Promise<void>,
  wait: number
): DebouncedFunction<T> {
  return useMemo(() => {
    return debounce(func, wait)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
