import type { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { ZodSchema } from 'zod'

export const asyncValidateRequestBody =
  (schema: ZodSchema): RequestHandler =>
  async (req, res, next) => {
    const parsed = await schema.safeParseAsync(req.body)

    if (!parsed.success) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ type: 'body', errors: parsed.error })
    }

    return next()
  }
