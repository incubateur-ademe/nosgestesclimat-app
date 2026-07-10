import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { config } from '../../config.ts'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import { ForbiddenException } from '../../core/errors/ForbiddenException.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import logger from '../../logger.ts'
import { rateLimitSameRequestMiddleware } from '../../middlewares/rateLimitSameRequestMiddleware.ts'
import { validateRequest } from '../../middlewares/validateRequest.ts'
import {
  COOKIE_NAME,
  getCookieOptions,
  login,
} from './authentication.service.ts'
import { LoginValidator } from './authentication.validator.ts'
import { AccountCreatedEvent } from './events/AccountCreated.event.ts'
import { LoginEvent } from './events/Login.event.ts'
import { reconcileSimulationsAfterLogin } from './handlers/reconcile-simulations-after-login.ts'
import { sendBrevoWelcomeEmail } from './handlers/send-welcome-email.ts'
import { syncUserDataAfterAccountCreated } from './handlers/sync-user-data-after-account-created.ts'
import { updateBrevoContact } from './handlers/update-brevo-contact.ts'

const router = express.Router()

EventBus.on(LoginEvent, updateBrevoContact)
EventBus.on(LoginEvent, sendBrevoWelcomeEmail)
EventBus.on(LoginEvent, reconcileSimulationsAfterLogin)
EventBus.on(AccountCreatedEvent, syncUserDataAfterAccountCreated)

/**
 * Logs a user in
 */
router
  .route('/v1/login')

  .post(
    rateLimitSameRequestMiddleware({
      ttlInSeconds: 30,
      hashRequest: ({ method, url, body }) => {
        return `${method}_${url}_${body.email}`
      },
    }),
    validateRequest(LoginValidator),
    async (req, res) => {
      try {
        const { token, user } = await login({
          loginDto: req.body,
          locale: req.query.locale,
        })

        res.cookie(COOKIE_NAME, token, getCookieOptions(config.app.origin))

        return res.status(StatusCodes.OK).json(user)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.UNAUTHORIZED).end()
        }

        if (err instanceof ForbiddenException) {
          return res.status(StatusCodes.FORBIDDEN).end()
        }

        logger.error('Login failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Logs a user out
 */
router.route('/v1/logout').post((_, res) => {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
    })

    return res.status(StatusCodes.OK).end()
  } catch (err) {
    logger.error('Logout failed', err)

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
  }
})

export default router
