import type { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as v from 'valibot'

type ValidationSchema<
  TParams extends v.GenericSchema = v.GenericSchema,
  TQuery extends v.GenericSchema = v.GenericSchema,
  TBody extends v.GenericSchema = v.GenericSchema,
> = {
  params: TParams
  query: TQuery
  body: TBody
}

export const validateRequest =
  <
    TParams extends v.GenericSchema,
    TQuery extends v.GenericSchema,
    TBody extends v.GenericSchema,
  >(
    schemas: ValidationSchema<TParams, TQuery, TBody>
  ): RequestHandler<
    v.InferOutput<TParams>,
    unknown,
    v.InferOutput<TBody>,
    v.InferOutput<TQuery>
  > =>
  async (req, res, next) => {
    const params = await v.safeParseAsync(schemas.params, req.params)

    if (!params.success) {
      return res.status(StatusCodes.BAD_REQUEST).json(params.issues)
    }
    req.params = params.output as Record<string, string>

    const query = await v.safeParseAsync(schemas.query, req.query)

    if (!query.success) {
      return res.status(StatusCodes.BAD_REQUEST).json(query.issues)
    }
    req.query = query.output as Record<string, string>

    const body = await v.safeParseAsync(schemas.body, req.body)

    if (!body.success) {
      return res.status(StatusCodes.BAD_REQUEST).json(body.issues)
    }
    req.body = body.output

    return next()
  }
