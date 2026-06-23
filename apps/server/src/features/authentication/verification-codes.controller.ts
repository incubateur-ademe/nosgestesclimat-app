import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { config } from '../../config.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import { withMinimumDuration } from '../../core/timing/with-minimum-duration.ts'
import logger from '../../logger.ts'
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
  }),
  validateRequest(VerificationCodeCreateValidator),
  async (req, res) => {
    const { minResponseTimeMs, responseTimeJitterMs } =
      config.security.verificationCode

    // Pad the whole request to a constant-time budget so the existence of a
    // user cannot be inferred from response-time differences.
    return withMinimumDuration(
      { minMs: minResponseTimeMs, jitterMs: responseTimeJitterMs },
      async () => {
        try {
          const verificationCode = await createVerificationCode({
            verificationCodeDto: req.body,
            origin: req.get('origin') || config.app.origin,
            ...req.query,
          })

          // Only expose email and expirationDate to avoid leaking internal data
          return res.status(StatusCodes.CREATED).json({
            email: verificationCode.email,
            expirationDate: verificationCode.expirationDate,
          })
        } catch (err) {
          logger.error('VerificationCode creation failed', err)

          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
        }
      }
    )
  }
)

export default router
