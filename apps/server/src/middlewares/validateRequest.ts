import type { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { z, ZodType } from 'zod'

type ValidationSchema<
  TParams extends ZodType = ZodType,
  TQuery extends ZodType = ZodType,
  TBody extends ZodType = ZodType,
> = {
  params: TParams
  query: TQuery
  body: TBody
}

export const validateRequest =
  <TParams extends ZodType, TQuery extends ZodType, TBody extends ZodType>(
    schemas: ValidationSchema<TParams, TQuery, TBody>
  ): RequestHandler<
    z.output<TParams>,
    unknown,
    z.output<TBody>,
    z.output<TQuery>
  > =>
  async (req, res, next) => {
    const params = await schemas.params.safeParseAsync(req.params)

    if (!params.success) {
      return res.status(StatusCodes.BAD_REQUEST).json(params.error)
    }
    req.params = params.data

    const query = await schemas.query.safeParseAsync(req.query)

    if (!query.success) {
      return res.status(StatusCodes.BAD_REQUEST).json(query.error)
    }
    req.query = query.data

    const body = await schemas.body.safeParseAsync(req.body)

    if (!body.success) {
      return res.status(StatusCodes.BAD_REQUEST).json(body.error)
    }
    req.body = body.data

    return next()
  }
