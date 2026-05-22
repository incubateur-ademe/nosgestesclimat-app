import type { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as v from 'valibot'

export const asyncValidateRequestBody =
  (schema: v.GenericSchema | v.GenericSchemaAsync): RequestHandler =>
  async (req, res, next) => {
    const parsed = await v.safeParseAsync(schema, req.body)

    if (!parsed.success) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ name: 'ZodError', issues: parsed.issues })
    }

    return next()
  }
