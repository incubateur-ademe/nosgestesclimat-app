export type ActionFrom = 'fin' | 'mon-espace' | 'index'

export type Inject<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
