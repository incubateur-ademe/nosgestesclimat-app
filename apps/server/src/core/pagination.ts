import type { Response } from 'express'
import z from 'zod'

export const PaginationQuery = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .min(1)
    .default(1)
    // allows pagination to be 0 indexed
    .transform((val) => val - 1),
  pageSize: z.coerce.number().int().positive().min(1).max(50).default(20),
})

export type PaginationQuery = z.infer<typeof PaginationQuery>

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
