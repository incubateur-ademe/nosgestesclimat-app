import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import { ForbiddenException } from '../../core/errors/ForbiddenException.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import logger from '../../logger.ts'
import { authentificationMiddleware } from '../../middlewares/authentificationMiddleware.ts'
import { validateRequest } from '../../middlewares/validateRequest.ts'
import { SimulationUpsertedEvent } from './events/SimulationUpserted.event.ts'
import { programComputation } from './handlers/program-computation.ts'
import { publishRedisEvent } from './handlers/publish-redis-event.ts'
import { sendSimulationUpserted } from './handlers/send-simulation-upserted.ts'
import { updateBrevoContact } from './handlers/update-brevo-contact.ts'
import { softDeleteSimulation } from './simulations.service.ts'
import { SimulationFetchValidator } from './simulations.validator.ts'

const router = express.Router()

EventBus.on(SimulationUpsertedEvent, updateBrevoContact)
EventBus.on(SimulationUpsertedEvent, sendSimulationUpserted)
EventBus.on(SimulationUpsertedEvent, publishRedisEvent)
EventBus.on(SimulationUpsertedEvent, programComputation)

/**
 * Soft deletes a simulation by associating it with a deleted user id
 */
router
  .route('/v1/:simulationId')
  .delete(
    authentificationMiddleware(),
    validateRequest(SimulationFetchValidator),
    async ({ params, user }, res) => {
      try {
        await softDeleteSimulation({ params, user: user! })

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
