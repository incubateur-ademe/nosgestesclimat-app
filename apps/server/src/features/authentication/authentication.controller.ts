import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { config } from '../../config.js'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.js'
import { ForbiddenException } from '../../core/errors/ForbiddenException.js'
import { EventBus } from '../../core/event-bus/event-bus.js'
import logger from '../../logger.js'
import { rateLimitSameRequestMiddleware } from '../../middlewares/rateLimitSameRequestMiddleware.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import {
  COOKIE_NAME,
  getCookieOptions,
  login,
} from './authentication.service.js'
import { LoginValidator } from './authentication.validator.js'
import { AccountCreatedEvent } from './events/AccountCreated.event.js'
import { LoginEvent } from './events/Login.event.js'
import { reconcileSimulationsAfterLogin } from './handlers/reconcile-simulations-after-login.js'
import { sendBrevoWelcomeEmail } from './handlers/send-welcome-email.js'
import { syncUserDataAfterAccountCreated } from './handlers/sync-user-data-after-account-created.js'
import { updateBrevoContact } from './handlers/update-brevo-contact.js'

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
        const origin = req.get('origin') || config.app.origin
        const { token, user } = await login({
          loginDto: req.body,
          origin,
          locale: req.query.locale,
        })

        res.cookie(COOKIE_NAME, token, getCookieOptions(origin))

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
