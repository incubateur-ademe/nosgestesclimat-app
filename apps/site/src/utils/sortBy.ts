export const sortBy = (f: (arg?: unknown) => unknown) => (list: unknown[]) =>
  list.sort((a: unknown, b: unknown) => {
    const fa = f(a) as number
    const fb = f(b) as number

    return fa < fb ? -1 : fa > fb ? 1 : 0
  })
