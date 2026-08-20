import { captureException } from '@sentry/node'
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import * as v from 'valibot'
import { config } from '../../config.ts'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import { ForbiddenException } from '../../core/errors/ForbiddenException.ts'
import { InvalidVerificationCodeException } from '../../core/errors/InvalidVerificationCodeException.ts'
import { bestEffort } from '../../core/event-bus/best-effort.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import logger, { errorMeta, maskEmail } from '../../logger.ts'
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

// Brevo is not part of the login contract: authentication is settled once the
// transaction commits, so a slow or failing Brevo must not turn it into a 500.
EventBus.on(LoginEvent, bestEffort('updateBrevoContact', updateBrevoContact))
EventBus.on(
  LoginEvent,
  bestEffort('sendBrevoWelcomeEmail', sendBrevoWelcomeEmail)
)
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
      const startedAt = Date.now()

      // The login endpoint is only reachable through the site's server-side
      // `fetchServer`, which always forwards the shared `x-internal-key`
      // alongside the session identity. Requiring it makes the `x-user-id`
      // header trustworthy - it is set from the signed session cookie by the
      // site proxy, not by the browser - so the "one session userId = one
      // account" invariant can rely on it instead of a client-settable field.
      if (req.headers['x-internal-key'] !== config.security.internalApiKey) {
        return res.status(StatusCodes.UNAUTHORIZED).end()
      }

      // The current session's userId travels as the `x-user-id` header. The
      // server uses it - not a client-provided body field - to enforce the
      // "one session userId = one account" invariant.
      const rawSessionUserId = req.headers['x-user-id']
      let sessionUserId: string | undefined
      if (typeof rawSessionUserId === 'string') {
        const parsedSessionUserId = v.safeParse(
          v.pipe(v.string(), v.uuid()),
          rawSessionUserId
        )
        if (!parsedSessionUserId.success) {
          return res.status(StatusCodes.BAD_REQUEST).end()
        }
        sessionUserId = parsedSessionUserId.output
      }

      const context = {
        userId: sessionUserId,
        email: maskEmail(req.body.email),
        locale: req.query.locale,
      }

      // Every branch below logs an outcome, so an attempt left without one is
      // how a request that hung - or killed the process - stays visible.
      logger.info('Login attempt', context)

      try {
        const { token, user, mode } = await login({
          loginDto: req.body,
          locale: req.query.locale,
          sessionUserId,
        })

        res.cookie(COOKIE_NAME, token, getCookieOptions(config.app.origin))

        logger.info('Login succeeded', {
          ...context,
          mode,
          durationMs: Date.now() - startedAt,
        })

        return res.status(StatusCodes.OK).json(user)
      } catch (err) {
        const outcome = { ...context, durationMs: Date.now() - startedAt }

        if (err instanceof InvalidVerificationCodeException) {
          const rejected = {
            ...outcome,
            rejection: err.rejection,
            ...err.context,
          }

          logger.warn('Login rejected: invalid verification code', rejected)

          captureException(err, {
            level: 'warning',
            extra: rejected,
          })

          return res.status(StatusCodes.UNAUTHORIZED).end()
        }

        if (err instanceof EntityNotFoundException) {
          logger.warn('Login rejected: entity not found', {
            ...outcome,
            ...errorMeta(err),
          })

          captureException(err, {
            level: 'warning',
            extra: outcome,
          })

          return res.status(StatusCodes.UNAUTHORIZED).end()
        }

        if (err instanceof ForbiddenException) {
          logger.warn('Login rejected: userId attached to another account', {
            ...outcome,
            ...errorMeta(err),
          })

          captureException(err, {
            level: 'warning',
            extra: outcome,
          })

          return res.status(StatusCodes.FORBIDDEN).end()
        }

        logger.error('Login failed', { ...outcome, ...errorMeta(err) })

        captureException(err, { extra: outcome })

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
