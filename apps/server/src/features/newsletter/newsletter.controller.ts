import express from 'express'
import { StatusCodes } from 'http-status-codes'
import * as v from 'valibot'
import { config } from '../../config.ts'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import { isVerifiedUser } from '../../core/typeguards/isVerifiedUser.ts'
import logger from '../../logger.ts'
import { authentificationMiddleware } from '../../middlewares/authentificationMiddleware.ts'
import { rateLimitSameRequestMiddleware } from '../../middlewares/rateLimitSameRequestMiddleware.ts'
import { validateRequest } from '../../middlewares/validateRequest.ts'
import {
  confirmNewsletterSubscriptions,
  sendNewsletterConfirmationEmail,
  updateNewslettersInscription,
} from './newsletter.service.ts'
import {
  NewsletterConfirmationValidator,
  NewsletterInscriptionValidator,
} from './newsletter.validator.ts'

const router = express.Router()

/**
 * Returns brevo newsletter fo given id
 */
router.route('/v1/inscription').post(
  validateRequest(NewsletterInscriptionValidator),
  authentificationMiddleware({ passIfUnauthorized: true }),
  rateLimitSameRequestMiddleware({
    ttlInSeconds: 15,
    hashRequest: ({ method, url, body, user }) => {
      if (!body.email || user) {
        return
      }
      return `${method}_${url}_${body.email}`
    },
  }),
  async (req, res) => {
    const origin =
      req.get('x-forwarded-origin') || req.get('origin') || config.app.origin
    try {
      if (isVerifiedUser(req.user)) {
        if (req.user.email !== req.body.email) {
          return res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: 'Email mismatch' })
        }
        await updateNewslettersInscription({
          email: req.user.email,
          listIds: req.body.listIds,
        })
      } else {
        await sendNewsletterConfirmationEmail({
          inscriptionDto: req.body,
          origin,
        })
      }
      return res.status(StatusCodes.OK).json(req.body)
    } catch (err) {
      logger.error('Newsletter inscription failed', err)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
    }
  }
)

router.route('/v1/confirmation').get(async (req, res) => {
  const parsedQuery = await v.safeParseAsync(
    NewsletterConfirmationValidator.query,
    req.query
  )

  if (!parsedQuery.success) {
    const redirectUrl = new URL(config.app.origin)
    redirectUrl.pathname = '/newsletter-confirmation'
    redirectUrl.searchParams.append('success', 'false')
    redirectUrl.searchParams.append(
      'status',
      StatusCodes.BAD_REQUEST.toString()
    )
    return res.redirect(redirectUrl.toString())
  }

  const redirectUrl = new URL(parsedQuery.output.origin)
  redirectUrl.pathname = '/newsletter-confirmation'
  const { searchParams: redirectSearchParams } = redirectUrl

  try {
    await confirmNewsletterSubscriptions({
      query: parsedQuery.output,
    })

    redirectSearchParams.append('success', 'true')
  } catch (err) {
    const expired = err instanceof EntityNotFoundException

    if (!expired) {
      logger.error('Newsletter confirmation failed', err)
    }

    redirectSearchParams.append('success', 'false')
    redirectSearchParams.append(
      'status',
      (expired
        ? StatusCodes.NOT_FOUND
        : StatusCodes.INTERNAL_SERVER_ERROR
      ).toString()
    )
  }

  return res.redirect(redirectUrl.toString())
})

export default router
