type SqlRequestParams = {
  take: number
  skip: number
  cursor?: { id: string }
}

export async function* batchFindMany<T extends { id: string }>(
  sqlRequest: (params: SqlRequestParams) => Promise<T[]>,
  { batchSize = 100 }: { batchSize?: number } = {}
) {
  let cursor: { id: string } | undefined

  while (true) {
    const items = await sqlRequest({
      take: batchSize,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor } : {}),
    })
    if (items.length === 0) {
      break
    }

    for (const item of items) {
      yield item
    }

    cursor = {
      id: items[items.length - 1].id,
    }
  }
}
