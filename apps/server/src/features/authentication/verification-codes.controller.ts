import { captureException } from '@sentry/node'
import { maskEmail } from '@nosgestesclimat/core/lib/pii'
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import logger, { errorMeta } from '../../logger.ts'
import { rateLimitSameRequestMiddleware } from '../../middlewares/rateLimitSameRequestMiddleware.ts'
import { validateRequest } from '../../middlewares/validateRequest.ts'
import { VerificationCodeCreatedEvent } from './events/VerificationCodeCreated.event.ts'
import { sendVerificationCode } from './handlers/send-verification-code.ts'
import { createVerificationCode } from './verification-codes.service.ts'
import { VerificationCodeCreateValidator } from './verification-codes.validator.ts'

const router = express.Router()

EventBus.on(VerificationCodeCreatedEvent, sendVerificationCode)

/**
 * Creates a verification code
 */
router.route('/v1/').post(
  rateLimitSameRequestMiddleware({
    ttlInSeconds: 30,
    hashRequest: ({ method, url, body }) => {
      if (!body.email) {
        return
      }
      return `${method}_${url}_${body.email}`
    },
    logContext: (req) => ({ email: maskEmail(req.body.email) }),
  }),
  validateRequest(VerificationCodeCreateValidator),
  async (req, res) => {
    const startedAt = Date.now()
    const context = {
      email: maskEmail(req.body.email),
      locale: req.query.locale,
      requestId: req.requestId,
    }

    try {
      const verificationCode = await createVerificationCode({
        verificationCodeDto: req.body,
        ...req.query,
      })

      logger.info('VerificationCode created', {
        ...context,
        // Lets us correlate "code created" with the "code rejected" diagnosis
        // of /v1/login, which logs the same id.
        verificationCodeId: verificationCode.id,
        expirationDate: verificationCode.expirationDate,
        durationMs: Date.now() - startedAt,
      })

      return res.status(StatusCodes.CREATED).json({
        email: verificationCode.email,
        expirationDate: verificationCode.expirationDate,
      })
    } catch (err) {
      const outcome = { ...context, durationMs: Date.now() - startedAt }

      logger.error('VerificationCode creation failed', {
        ...outcome,
        ...errorMeta(err),
      })

      captureException(err, {
        extra: outcome,
      })

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
    }
  }
)

export default router
