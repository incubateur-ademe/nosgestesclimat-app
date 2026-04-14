class SafeSessionStorage {
  private _safeExecute<T>(operation: () => T, defaultValue: T): T {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return operation()
      }
      return defaultValue
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('SessionStorage is not accessible:', error)
      return defaultValue
    }
  }

  getItem(key: string): string | null {
    return this._safeExecute(() => window.sessionStorage.getItem(key), null)
  }

  setItem(key: string, value: string): void {
    this._safeExecute(
      () => window.sessionStorage.setItem(key, value),
      undefined
    )
  }

  removeItem(key: string): void {
    this._safeExecute(() => window.sessionStorage.removeItem(key), undefined)
  }

  clear(): void {
    this._safeExecute(() => window.sessionStorage.clear(), undefined)
  }

  key(index: number): string | null {
    return this._safeExecute(() => window.sessionStorage.key(index), null)
  }

  get length(): number {
    return this._safeExecute(() => window.sessionStorage.length, 0)
  }
}

export const safeSessionStorage = new SafeSessionStorage()
