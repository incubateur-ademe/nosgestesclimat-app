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
import { validateRequest } from '../../middlewares/validateRequest.js'
import {
  COOKIE_NAME,
  getCookieOptions,
} from '../authentication/authentication.service.js'
import { rateLimitSameRequestMiddleware } from '../../middlewares/rateLimitSameRequestMiddleware.js'
import { SimulationUpsertedEvent } from './events/SimulationUpserted.event.js'
import { publishRedisEvent } from './handlers/publish-redis-event.js'
import { sendSimulationUpserted } from './handlers/send-simulation-upserted.js'
import { updateBrevoContact } from './handlers/update-brevo-contact.js'
import {
  createSimulation,
  softDeleteSimulation,
  fetchSimulation,
  fetchSimulations,
} from './simulations.service.js'
import type {
  SimulationCreateQuery,
  SimulationsFetchQuery,
} from './simulations.validator.js'
import {
  SimulationCreateValidator,
  SimulationFetchValidator,
  SimulationsFetchValidator,
} from './simulations.validator.js'

const router = express.Router()

EventBus.on(SimulationUpsertedEvent, updateBrevoContact)
EventBus.on(SimulationUpsertedEvent, sendSimulationUpserted)
EventBus.on(SimulationUpsertedEvent, publishRedisEvent)

/**
 * Upserts a simulation
 */
router.route('/v1/:userId').post(
  authentificationMiddleware<unknown, unknown, unknown, SimulationCreateQuery>({
    passIfUnauthorized: true,
  }),
  rateLimitSameRequestMiddleware({
    ttlInSeconds: 30,
    hashRequest: ({ method, url, query }) => {
      if (!query.code || !query.email || typeof query.email !== 'string') {
        return
      }
      return `${method}_${url}_${query.email}`
    },
  }),
  validateRequest(SimulationCreateValidator),
  async (req, res) => {
    try {
      const origin = req.get('origin') || config.app.origin
      const { simulation, token } = await createSimulation({
        simulationDto: req.body,
        query: req.query,
        params: req.params,
        origin,
        user: req.user,
      })

      if (token) {
        res.cookie(COOKIE_NAME, token, getCookieOptions(origin))
      }

      return res.status(StatusCodes.CREATED).json(simulation)
    } catch (err) {
      if (err instanceof ImmutableSimulationException) {
        return res.status(StatusCodes.BAD_REQUEST).send(err.message).end()
      }

      if (err instanceof EntityNotFoundException) {
        return res.status(StatusCodes.UNAUTHORIZED).end()
      }

      logger.error('Simulation creation failed', err)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
    }
  }
)

/**
 * Returns simulations for a user
 */
router
  .route('/v1/:userId')
  .get(
    authentificationMiddleware<
      unknown,
      unknown,
      unknown,
      SimulationsFetchQuery
    >({ passIfUnauthorized: true }),
    validateRequest(SimulationsFetchValidator),
    async ({ params, query, user }, res) => {
      try {
        const { simulations, count } = await fetchSimulations({
          params,
          query,
          user,
        })
        return withPaginationHeaders({
          ...query,
          count,
        })(res)
          .status(StatusCodes.OK)
          .json(simulations)
      } catch (err) {
        logger.error('Simulations fetch failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Returns simulations for a user and an id
 */
router
  .route('/v1/:userId/:simulationId')
  .get(
    authentificationMiddleware({ passIfUnauthorized: true }),
    validateRequest(SimulationFetchValidator),
    async ({ params }, res) => {
      try {
        const simulation = await fetchSimulation(params)

        return res.status(StatusCodes.OK).json(simulation)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        logger.error('Simulation fetch failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Soft deletes a simulation by associating it with a deleted user id
 */
router
  .route('/v1/:userId/:simulationId')
  .delete(
    authentificationMiddleware(),
    validateRequest(SimulationFetchValidator),
    async ({ params, user }, res) => {
      try {
        await softDeleteSimulation({ params, user })

        return res
          .status(StatusCodes.ACCEPTED)
          .send({
            success: true,
          })
          .end()
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        if (err instanceof ForbiddenException) {
          return res.status(StatusCodes.FORBIDDEN).send(err.message).end()
        }

        logger.error('Simulation deletion failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

export default router
