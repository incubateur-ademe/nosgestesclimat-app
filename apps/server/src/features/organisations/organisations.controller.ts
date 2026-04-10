import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { config } from '../../config.js'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.js'
import { ForbiddenException } from '../../core/errors/ForbiddenException.js'
import { ImmutableSimulationException } from '../../core/errors/ImmutableSimulationException.js'
import { EventBus } from '../../core/event-bus/event-bus.js'
import { withPaginationHeaders } from '../../core/pagination.js'
import logger from '../../logger.js'
import { authentificationMiddleware } from '../../middlewares/authentificationMiddleware.js'
import { rateLimitSameRequestMiddleware } from '../../middlewares/rateLimitSameRequestMiddleware.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import {
  COOKIE_NAME,
  getCookieOptions,
} from '../authentication/authentication.service.js'
import {
  createPollSimulation,
  fetchPublicPollSimulations,
} from '../simulations/simulations.service.js'
import { OrganisationPollSimulationCreateValidator } from '../simulations/simulations.validator.js'
import { OrganisationCreatedEvent } from './events/OrganisationCreated.event.js'
import { OrganisationUpdatedEvent } from './events/OrganisationUpdated.event.js'
import { PollCreatedEvent } from './events/PollCreated.event.js'
import { PollDeletedEvent } from './events/PollDeletedEvent.js'
import { PollUpdatedEvent } from './events/PollUpdated.event.js'
import { addOrUpdateBrevoContact } from './handlers/add-or-update-brevo-contact.js'
import { addOrUpdateConnectContact } from './handlers/add-or-update-connect-contact.js'
import { sendOrganisationCreated } from './handlers/send-organisation-created.js'
import { sendPollCreated } from './handlers/send-poll-created.js'
import {
  createOrganisation,
  createPoll,
  deletePoll,
  fetchOrganisation,
  fetchOrganisations,
  fetchPoll,
  fetchPolls,
  fetchPublicPoll,
  getDownloadPollSimulationResultJob,
  startDownloadPollSimulationResultJob,
  updateOrganisation,
  updatePoll,
} from './organisations.service.js'
import type { OrganisationsFetchQuery } from './organisations.validator.js'
import {
  OrganisationCreateValidator,
  OrganisationFetchValidator,
  OrganisationPollCreateValidator,
  OrganisationPollDeleteValidator,
  OrganisationPollFetchValidator,
  OrganisationPollsFetchValidator,
  OrganisationPollSimulationsDownloadValidator,
  OrganisationPollUpdateValidator,
  OrganisationPublicPollFetchValidator,
  OrganisationPublicPollSimulationsFetchValidator,
  OrganisationsFetchValidator,
  OrganisationUpdateValidator,
} from './organisations.validator.js'

const router = express.Router()

EventBus.on(OrganisationCreatedEvent, sendOrganisationCreated)
EventBus.on(OrganisationCreatedEvent, addOrUpdateBrevoContact)
EventBus.on(OrganisationCreatedEvent, addOrUpdateConnectContact)

/**
 * Creates a new organisation
 */
router
  .route('/v1/')
  .post(
    authentificationMiddleware(),
    validateRequest(OrganisationCreateValidator),
    async (req, res) => {
      try {
        const organisation = await createOrganisation({
          organisationDto: req.body,
          origin: req.get('origin') || config.app.origin,
          locale: req.query.locale,
          user: req.user!,
        })

        return res.status(StatusCodes.CREATED).json(organisation)
      } catch (err) {
        if (err instanceof ForbiddenException) {
          return res.status(StatusCodes.FORBIDDEN).send(err.message).end()
        }

        logger.error('Organisation creation failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

EventBus.on(OrganisationUpdatedEvent, addOrUpdateBrevoContact)
EventBus.on(OrganisationUpdatedEvent, addOrUpdateConnectContact)

/**
 * Updates a user organisation
 */
router
  .route('/v1/:organisationIdOrSlug')
  .put(
    authentificationMiddleware(),
    validateRequest(OrganisationUpdateValidator),
    async (req, res) => {
      const { body, params, query, user } = req
      try {
        const { organisation, token } = await updateOrganisation({
          params,
          organisationDto: body,
          code: query.code,
          user: user!,
        })

        if (token) {
          const origin = req.get('origin') || config.app.origin
          res.cookie(COOKIE_NAME, token, getCookieOptions(origin))
        }

        return res.status(StatusCodes.OK).json(organisation)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        if (err instanceof ForbiddenException) {
          return res.status(StatusCodes.FORBIDDEN).send(err.message).end()
        }

        logger.error('Organisation update failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Returns organisations for a user
 */
router
  .route('/v1/')
  .get(
    authentificationMiddleware<
      unknown,
      unknown,
      unknown,
      OrganisationsFetchQuery
    >(),
    validateRequest(OrganisationsFetchValidator),
    async ({ user, query }, res) => {
      try {
        const { organisations, count } = await fetchOrganisations({
          user: user!,
          query,
        })

        return withPaginationHeaders({ ...query, count })(res)
          .status(StatusCodes.OK)
          .json(organisations)
      } catch (err) {
        logger.error('Organisations fetch failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Returns organisation for an id or a slug
 */
router
  .route('/v1/:organisationIdOrSlug')
  .get(
    authentificationMiddleware(),
    validateRequest(OrganisationFetchValidator),
    async ({ params, user }, res) => {
      try {
        const organisation = await fetchOrganisation({ params, user: user! })

        return res.status(StatusCodes.OK).json(organisation)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        logger.error('Organisation fetch failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

EventBus.on(PollCreatedEvent, addOrUpdateBrevoContact)
EventBus.on(PollCreatedEvent, sendPollCreated)

/**
 * Creates a new poll for an organisation
 */
router
  .route('/v1/:organisationIdOrSlug/polls')
  .post(
    authentificationMiddleware(),
    validateRequest(OrganisationPollCreateValidator),
    async (req, res) => {
      try {
        const poll = await createPoll({
          origin: req.get('origin') || config.app.origin,
          locale: req.query.locale,
          pollDto: req.body,
          user: req.user!,
          params: req.params,
        })

        return res.status(StatusCodes.CREATED).json(poll)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        logger.error('Poll creation failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

EventBus.on(PollUpdatedEvent, addOrUpdateBrevoContact)

/**
 * Updates a poll for an organisation
 */
router
  .route('/v1/:organisationIdOrSlug/polls/:pollIdOrSlug')
  .put(
    authentificationMiddleware(),
    validateRequest(OrganisationPollUpdateValidator),
    async ({ body, params, user }, res) => {
      try {
        const poll = await updatePoll({
          pollDto: body,
          user: user!,
          params,
        })

        return res.status(StatusCodes.OK).json(poll)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        logger.error('Poll update failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

EventBus.on(PollDeletedEvent, addOrUpdateBrevoContact)

/**
 * Deletes a poll for an organisation
 */
router
  .route('/v1/:organisationIdOrSlug/polls/:pollIdOrSlug')
  .delete(
    authentificationMiddleware(),
    validateRequest(OrganisationPollDeleteValidator),
    async ({ params, user }, res) => {
      try {
        await deletePoll({
          user: user!,
          params,
        })

        return res.status(StatusCodes.NO_CONTENT).end()
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        logger.error('Poll delete failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Returns polls for an organisation
 */
router
  .route('/v1/:organisationIdOrSlug/polls')
  .get(
    authentificationMiddleware(),
    validateRequest(OrganisationPollsFetchValidator),
    async ({ params, user }, res) => {
      try {
        const polls = await fetchPolls({
          user: user!,
          params,
        })

        return res.status(StatusCodes.OK).json(polls)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        logger.error('Polls fetch failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Returns poll for an organisation and an id or a slug
 */
router
  .route('/v1/:organisationIdOrSlug/polls/:pollIdOrSlug')
  .get(
    authentificationMiddleware(),
    validateRequest(OrganisationPollFetchValidator),
    async ({ params, user }, res) => {
      try {
        const poll = await fetchPoll({
          user: user!,
          params,
        })

        return res.status(StatusCodes.OK).json(poll)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        logger.error('Poll fetch failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Returns a job that can be polled to get the campaign simulations result
 */
router
  .route('/v1/:organisationIdOrSlug/polls/:pollIdOrSlug/simulations/download')
  .get(
    authentificationMiddleware(),
    validateRequest(OrganisationPollSimulationsDownloadValidator),
    async ({ params, user, query }, res) => {
      try {
        const { jobId } = query
        if (jobId) {
          const { status, job } = await getDownloadPollSimulationResultJob({
            user: user!,
            params,
            jobId,
          })

          return res.status(status).json(job)
        }

        const job = await startDownloadPollSimulationResultJob({
          user: user!,
          params,
        })

        return res.status(StatusCodes.ACCEPTED).json(job)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        logger.error('Poll download simulations failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Upserts simulation poll for an organisation and an id or a slug
 */
router
  .route('/v1/:userId/public-polls/:pollIdOrSlug/simulations')
  .post(
    rateLimitSameRequestMiddleware(),
    authentificationMiddleware({ passIfUnauthorized: true }),
    validateRequest(OrganisationPollSimulationCreateValidator),
    async (req, res) => {
      try {
        const simulation = await createPollSimulation({
          simulationDto: req.body,
          origin: req.get('origin') || config.app.origin,
          locale: req.query.locale,
          params: req.params,
          user: req.user,
        })

        return res.status(StatusCodes.CREATED).json(simulation)
      } catch (err) {
        if (err instanceof ImmutableSimulationException) {
          return res.status(StatusCodes.BAD_REQUEST).send(err.message).end()
        }

        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        logger.error('Poll simulation creation failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Returns poll informations for public or administrator users following authentication
 */
router
  .route('/v1/:userId/public-polls/:pollIdOrSlug')
  .get(
    authentificationMiddleware({ passIfUnauthorized: true }),
    validateRequest(OrganisationPublicPollFetchValidator),
    async (req, res) => {
      try {
        // if (req.user && req.user.userId !== req.params.userId) {
        //   throw new ForbiddenException(`Different user ids found`)
        // }

        const poll = await fetchPublicPoll(req)

        return res.status(StatusCodes.OK).json(poll)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        if (err instanceof ForbiddenException) {
          return res.status(StatusCodes.FORBIDDEN).send(err.message).end()
        }

        logger.error('Public poll fetch failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Returns poll simulations for public or administrator users following authentication
 */
router
  .route('/v1/:userId/public-polls/:pollIdOrSlug/simulations')
  .get(
    authentificationMiddleware({ passIfUnauthorized: true }),
    validateRequest(OrganisationPublicPollSimulationsFetchValidator),
    async (req, res) => {
      try {
        // if (req.user && req.user.userId !== req.params.userId) {
        //   throw new ForbiddenException(`Different user ids found`)
        // }

        const simulations = await fetchPublicPollSimulations(req)

        return res.status(StatusCodes.OK).json(simulations)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        if (err instanceof ForbiddenException) {
          return res.status(StatusCodes.FORBIDDEN).send(err.message).end()
        }

        logger.error('Public poll simulations fetch failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

export default router
