import type { Response } from 'express'
import * as v from 'valibot'

export const PaginationQuery = v.strictObject({
  page: v.pipe(
    v.optional(
      v.pipe(
        v.unknown(),
        v.transform(Number),
        v.number(),
        v.integer(),
        v.minValue(1)
      ),
      1
    ),
    // allows pagination to be 0 indexed
    v.transform((val) => val - 1)
  ),
  pageSize: v.optional(
    v.pipe(
      v.unknown(),
      v.transform(Number),
      v.number(),
      v.integer(),
      v.minValue(1),
      v.maxValue(50)
    ),
    20
  ),
})

export type PaginationQuery = v.InferOutput<typeof PaginationQuery>

export const withPaginationHeaders = ({
  pageSize,
  page,
  count,
}: PaginationQuery & { count: number }) => {
  const totalPages = Math.ceil(count / pageSize)
  const currentPage = page + 1

  return (res: Response) =>
    res.setHeaders(
      new Map([
        ['x-page', currentPage],
        ['x-page-size', pageSize],
        [
          'x-page-items',
          currentPage < totalPages
            ? pageSize
            : currentPage > totalPages
              ? 0
              : count % pageSize,
        ],
        ['x-total-pages', totalPages],
        ['x-total-items', count],
      ])
    )
}
