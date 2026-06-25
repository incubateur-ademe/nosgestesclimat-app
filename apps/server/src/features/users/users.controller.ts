import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { config } from '../../config.ts'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import { ForbiddenException } from '../../core/errors/ForbiddenException.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import logger from '../../logger.ts'
import { authentificationMiddleware } from '../../middlewares/authentificationMiddleware.ts'
import { validateRequest } from '../../middlewares/validateRequest.ts'
import {
  COOKIE_NAME,
  getCookieOptions,
} from '../authentication/authentication.service.ts'
import { UserUpdatedEvent } from './events/UserUpdated.event.ts'
import { addOrUpdateBrevoContact } from './handlers/add-or-update-brevo-contact.ts'
import { removePreviousBrevoContact } from './handlers/remove-previous-brevo-contact.ts'
import { fetchUserContact, updateUserAndContact } from './users.service.ts'
import {
  FetchMeValidator,
  FetchUserContactValidator,
  UpdateUserValidator,
} from './users.validator.ts'

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
      return res.status(StatusCodes.OK).json({
        id: req.user!.id,
        email: 'email' in req.user! ? req.user.email : undefined,
      })
    }
  )

EventBus.on(UserUpdatedEvent, addOrUpdateBrevoContact)
EventBus.on(UserUpdatedEvent, removePreviousBrevoContact)

/**
 * Upserts user for given user id
 */
router
  .route('/v1')
  .put(
    authentificationMiddleware(),
    validateRequest(UpdateUserValidator),
    async (req, res) => {
      try {
        const origin = req.get('origin') || config.app.origin

        const { user, verified, token } = await updateUserAndContact({
          user: req.user!,
          code: req.query.code,
          newUserData: req.body,
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
