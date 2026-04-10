import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { config } from '../../config.js'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.js'
import { ForbiddenException } from '../../core/errors/ForbiddenException.js'
import { EventBus } from '../../core/event-bus/event-bus.js'
import logger from '../../logger.js'
import { authentificationMiddleware } from '../../middlewares/authentificationMiddleware.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import {
  COOKIE_NAME,
  getCookieOptions,
} from '../authentication/authentication.service.js'
import { UserUpdatedEvent } from './events/UserUpdated.event.js'
import { addOrUpdateBrevoContact } from './handlers/add-or-update-brevo-contact.js'
import { removePreviousBrevoContact } from './handlers/remove-previous-brevo-contact.js'
import { fetchUserContact, updateUserAndContact } from './users.service.js'
import {
  FetchMeValidator,
  FetchUserContactValidator,
  UpdateUserValidator,
} from './users.validator.js'

const router = express.Router()

/**
 * Returns user contact for given user id
 */
router
  .route('/v1/me/contact')

  .get(
    authentificationMiddleware(),
    validateRequest(FetchUserContactValidator),
    async (req, res) => {
      try {
        const contact = await fetchUserContact(req.user!)

        return res.status(StatusCodes.OK).json(contact)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        logger.error('User contact fetch failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Returns current user data
 */
router
  .route('/v1/me')
  .get(
    authentificationMiddleware(),
    validateRequest(FetchMeValidator),
    (req, res) => {
      const user = req.user!

      return res.status(StatusCodes.OK).json({
        id: user.userId,
        email: user.email,
      })
    }
  )

EventBus.on(UserUpdatedEvent, addOrUpdateBrevoContact)
EventBus.on(UserUpdatedEvent, removePreviousBrevoContact)

/**
 * Upserts user for given user id
 */
router
  .route('/v1/:userId')
  .put(
    authentificationMiddleware({ passIfUnauthorized: true }),
    validateRequest(UpdateUserValidator),
    async (req, res) => {
      try {
        if (req.user && req.user.userId !== req.params.userId) {
          throw new ForbiddenException('Different user ids found')
        }

        const origin = req.get('origin') || config.app.origin

        const { user, verified, token } = await updateUserAndContact({
          params: req.user || req.params,
          code: req.query.code,
          userDto: req.body,
          origin,
        })

        if (token) {
          res.cookie(COOKIE_NAME, token, getCookieOptions(origin))
        }

        return verified
          ? res.status(StatusCodes.OK).json(user)
          : res.status(StatusCodes.ACCEPTED).json(user)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        if (err instanceof ForbiddenException) {
          return res.status(StatusCodes.FORBIDDEN).send(err.message).end()
        }

        logger.error('User update failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

export default router
