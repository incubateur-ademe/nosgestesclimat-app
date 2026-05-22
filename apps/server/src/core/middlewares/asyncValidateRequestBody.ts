import type { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as v from 'valibot'

export const asyncValidateRequestBody =
  (schema: v.GenericSchema): RequestHandler =>
  async (req, res, next) => {
    const parsed = await v.safeParseAsync(schema, req.body)

    if (!parsed.success) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ type: 'body', errors: parsed.issues })
    }

    return next()
  }
