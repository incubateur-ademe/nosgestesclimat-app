class SafeLocalStorage {
  private _safeExecute<T>(operation: () => T, defaultValue: T): T {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return operation()
      }
      return defaultValue
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('LocalStorage is not accessible:', error)
      return defaultValue
    }
  }

  getItem(key: string): string | null {
    return this._safeExecute(() => window.localStorage.getItem(key), null)
  }

  setItem(key: string, value: string): void {
    this._safeExecute(() => window.localStorage.setItem(key, value), undefined)
  }

  removeItem(key: string): void {
    this._safeExecute(() => window.localStorage.removeItem(key), undefined)
  }

  clear(): void {
    this._safeExecute(() => window.localStorage.clear(), undefined)
  }

  key(index: number): string | null {
    return this._safeExecute(() => window.localStorage.key(index), null)
  }

  get length(): number {
    return this._safeExecute(() => window.localStorage.length, 0)
  }
}

export const safeLocalStorage = new SafeLocalStorage()
