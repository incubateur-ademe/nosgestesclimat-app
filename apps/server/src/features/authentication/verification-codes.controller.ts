import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { config } from '../../config.js'
import { ConflictException } from '../../core/errors/ConflictException.js'
import { EventBus } from '../../core/event-bus/event-bus.js'
import logger from '../../logger.js'
import { rateLimitSameRequestMiddleware } from '../../middlewares/rateLimitSameRequestMiddleware.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { VerificationCodeCreatedEvent } from './events/VerificationCodeCreated.event.js'
import { sendVerificationCode } from './handlers/send-verification-code.js'
import { createVerificationCode } from './verification-codes.service.js'
import { VerificationCodeCreateValidator } from './verification-codes.validator.js'

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
