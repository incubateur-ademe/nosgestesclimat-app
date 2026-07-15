import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import { ForbiddenException } from '../../core/errors/ForbiddenException.ts'
import { ImmutableSimulationException } from '../../core/errors/ImmutableSimulationException.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import logger from '../../logger.ts'
import { authentificationMiddleware } from '../../middlewares/authentificationMiddleware.ts'
import { validateRequest } from '../../middlewares/validateRequest.ts'
import { GroupCreatedEvent } from './events/GroupCreated.event.ts'
import { GroupDeletedEvent } from './events/GroupDeleted.event.ts'
import { GroupUpdatedEvent } from './events/GroupUpdated.event.ts'
import {
  createGroup,
  createParticipant,
  deleteGroup,
  fetchGroup,
  fetchGroups,
  removeParticipant,
  updateGroup,
} from './groups.service.ts'
import {
  GroupCreateValidator,
  GroupDeleteValidator,
  GroupFetchValidator,
  GroupsFetchValidator,
  GroupUpdateValidator,
  ParticipantCreateValidator,
  ParticipantDeleteValidator,
} from './groups.validator.ts'
import {
  addOrUpdateBrevoAdministratorContact,
  addOrUpdateBrevoParticipantContact,
} from './handlers/add-or-update-brevo-contact.ts'

const router = express.Router()

EventBus.on(GroupCreatedEvent, addOrUpdateBrevoAdministratorContact)

/**
 * Creates a new group
 */
router
  .route('/v1/')
  .post(
    authentificationMiddleware(),
    validateRequest(GroupCreateValidator),
    async (req, res) => {
      try {
        const group = await createGroup({
          groupDto: req.body,
          user: req.user!,
        })

        return res.status(StatusCodes.CREATED).json(group)
      } catch (err) {
        if (err instanceof ImmutableSimulationException) {
          return res.status(StatusCodes.BAD_REQUEST).send(err.message).end()
        }

        logger.error('Group creation failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

EventBus.on(GroupUpdatedEvent, addOrUpdateBrevoAdministratorContact)
EventBus.on(GroupUpdatedEvent, addOrUpdateBrevoParticipantContact)

/**
 * Updates a user group
 */
router
  .route('/v1/:groupId')
  .put(
    authentificationMiddleware(),
    validateRequest(GroupUpdateValidator),
    async (req, res) => {
      try {
        const group = await updateGroup(
          { groupId: req.params.groupId, user: req.user! },
          req.body
        )

        return res.status(StatusCodes.OK).json(group)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        logger.error('Group update failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Adds a participant to a group (participant joins)
 */
router
  .route('/v1/:groupId/participants')
  .post(
    authentificationMiddleware(),
    validateRequest(ParticipantCreateValidator),
    async (req, res) => {
      try {
        const participant = await createParticipant({
          params: req.params,
          participantDto: req.body,
          user: req.user!,
        })

        return res.status(StatusCodes.CREATED).json(participant)
      } catch (err) {
        if (err instanceof ImmutableSimulationException) {
          return res.status(StatusCodes.BAD_REQUEST).send(err.message).end()
        }

        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        logger.error('Participant creation failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Removes a participant from a group (participant leaves)
 */
router
  .route('/v1/:groupId/participants/:participantId')
  .delete(
    authentificationMiddleware(),
    validateRequest(ParticipantDeleteValidator),
    async (req, res) => {
      try {
        await removeParticipant({
          groupId: req.params.groupId,
          participantId: req.params.participantId,
          user: req.user!,
        })

        return res.status(StatusCodes.NO_CONTENT).end()
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        if (err instanceof ForbiddenException) {
          return res.status(StatusCodes.FORBIDDEN).send(err.message).end()
        }

        logger.error('Participant deletion failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Returns groups for a user
 */
router
  .route('/v1')
  .get(
    authentificationMiddleware(),
    validateRequest(GroupsFetchValidator),
    async ({ query, user }, res) => {
      try {
        const groups = await fetchGroups(user!, query)

        return res.status(StatusCodes.OK).json(groups)
      } catch (err) {
        logger.error('Groups fetch failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

/**
 * Returns group for a user and an id
 */
router
  .route('/v1/:groupId')
  .get(
    authentificationMiddleware({ passIfUnauthorized: true }),
    validateRequest(GroupFetchValidator),
    async ({ params, user }, res) => {
      try {
        const group = await fetchGroup({ groupId: params.groupId, user })

        return res.status(StatusCodes.OK).json(group)
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        logger.error('Group fetch failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

EventBus.on(GroupDeletedEvent, addOrUpdateBrevoAdministratorContact)
EventBus.on(GroupDeletedEvent, addOrUpdateBrevoParticipantContact)

/**
 * Deletes group for a user and an id
 */
router
  .route('/v1/:groupId')
  .delete(
    authentificationMiddleware(),
    validateRequest(GroupDeleteValidator),
    async (req, res) => {
      try {
        await deleteGroup({ userId: req.user!.id, groupId: req.params.groupId })

        return res.status(StatusCodes.NO_CONTENT).end()
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
        }

        logger.error('Group delete failed', err)

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
      }
    }
  )

export default router
