import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { config } from '../../config.ts'
import { ConflictException } from '../../core/errors/ConflictException.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
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
    try {
      const verificationCode = await createVerificationCode({
        verificationCodeDto: req.body,
        origin: req.get('origin') || config.app.origin,
        ...req.query,
      })

      return res.status(StatusCodes.CREATED).json(verificationCode)
    } catch (err) {
      if (err instanceof ConflictException) {
        return res.status(StatusCodes.CONFLICT).send(err.message).end()
      }

      logger.error('VerificationCode creation failed', err)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
    }
  }
)

export default router
