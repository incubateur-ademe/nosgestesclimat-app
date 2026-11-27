import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from 'publicodes'
import type { BackgroundTaskRunner } from '../../../lib/background-task-runner.ts'
import { invariant } from '../../../lib/invariant.ts'
import type { Result } from '../../../lib/result.ts'
import { failure, success } from '../../../lib/result.ts'
import { runSideEffect } from '../../../lib/run-side-effect.ts'
import { transaction } from '../../../lib/transaction.ts'
import type { AppUser } from '../../auth/types/user-session.ts'
import { Attributes } from '../../emails/email.constant.ts'
import type { AddOrUpdateContact, SendEmail } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { findManyGroupsBySimulationId } from '../../groups/repositories/group.repository.ts'
import type { Group } from '../../groups/types/group.ts'
import type { Logger } from '../../logger/index.ts'
import {
  parseModel,
  serializeModel,
} from '../../models/helpers/model-versions.ts'
import { findManyPollSummariesBySimulationId } from '../../polls/repositories/poll.repository.ts'
import { enqueuePollStatsComputation } from '../../polls/stats/services/enqueue-poll-stats-computation.ts'
import type { PollSummary } from '../../polls/types/poll.ts'
import { isModelSupported } from '../../simulation-computation/model-support/is-model-supported.ts'
import {
  createSimulationComputation,
  findSimulationComputation,
} from '../../simulation-computation/repositories/simulation-computations.repository.ts'
import type { SimulationComputationStatus } from '../../simulation-computation/types/computation.ts'
import { findUserById } from '../../users/repositories/users.repository.ts'
import { mapComputedResultsToContactAttributes } from '../emails/map-computed-results-to-contact-attributes.ts'
import {
  createGroupCreatedEmail,
  createGroupJoinedEmail,
  createPollJoinedEmail,
} from '../emails/simulation-emails.ts'
import {
  type CompleteSimulationError,
  SimulationCompletedError,
  SimulationIncompleteError,
  SimulationInvalidModelStringError,
  SimulationNotFoundError,
  ZeroFootprintError,
} from '../errors/simulations.error.ts'
import { isSimulationCompleted } from '../helpers/simulation-guards.ts'
import {
  findSimulationById,
  updateSimulation,
} from '../repository/simulation.repository.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'

interface CompleteSimulationDependencies {
  logger: Logger
  addOrUpdateContact: AddOrUpdateContact
  sendEmail: SendEmail
  /** Public origin the emails link back to */
  origin: string
  /** Runs the post-completion side effects outside of the request lifecycle */
  backgroundTaskRunner: BackgroundTaskRunner
  /** Injectable so tests assert the poll schedule without waiting real
   * seconds; defaults to a real promise-based `setTimeout`. */
  sleep?: (ms: number) => Promise<void>
}

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export function createCompleteSimulation({
  logger,
  addOrUpdateContact,
  sendEmail,
  origin,
  backgroundTaskRunner,
  sleep = defaultSleep,
}: CompleteSimulationDependencies) {
  return logger.withSpan(
    'core.service.completeSimulation',
    ['simulationId', 'model'],
    async ({
      userSession,
      simulationId,
      progression,
      model,
      situation,
      foldedSteps,
      computedResults,
      locale,
      logger,
    }: {
      userSession: AppUser
      simulationId: string
      progression: number
      /** The model the client ran the test with; persisted with the completion. */
      model: string
      situation: Situation<DottedName>
      foldedSteps: DottedName[]
      computedResults: ComputedResults
      locale: ISOSupportedLanguage
      logger: Logger
    }): Promise<
      Result<{ groups: Group[]; polls: PollSummary[] }, CompleteSimulationError>
    > => {
      const userId = userSession.id

      if (progression !== 1) return failure(new SimulationIncompleteError())
      if (computedResults.carbone.bilan === 0) {
        return failure(new ZeroFootprintError())
      }

      // The client's model is the one its answers were given against — never
      // substituted by the persisted one, which can be stale.
      const clientModel = parseModel(model)
      if (!clientModel)
        return failure(new SimulationInvalidModelStringError(model))

      const simulation = await findSimulationById({
        id: simulationId,
        userId,
      })
      if (!simulation) return failure(new SimulationNotFoundError())
      if (isSimulationCompleted(simulation))
        return failure(new SimulationCompletedError())

      const isModelSupportedForComputation = isModelSupported(clientModel)

      if (!isModelSupportedForComputation) {
        logger.warn('Unsupported model', {
          model: clientModel,
        })
      }

      const polls = await findManyPollSummariesBySimulationId({
        simulationId,
      })

      const updated = await transaction(async (tx) => {
        const update = await updateSimulation(
          {
            id: simulationId,
            userId,
            situation,
            foldedSteps,
            progression,
            computedResults,
            model: serializeModel(clientModel),
          },
          tx
        )
        if (!update.success) return update

        if (isModelSupportedForComputation) {
          const computation = await createSimulationComputation(
            simulationId,
            tx
          )
          if (!computation.success) return computation
        }

        // The completed simulation changes the poll totals; every poll it belongs
        // to is queued for a full recomputation.
        for (const { id } of polls) {
          const enqueued = await enqueuePollStatsComputation(id, tx)
          if (!enqueued.success) return enqueued
        }

        return success()
      })

      if (!updated.success) return updated

      // A computation row exists only when the model was supported: wait for
      // it, bounded, so the redirect lands with the rule evaluations written.
      if (isModelSupportedForComputation) {
        await waitForSimulationComputation({ logger, sleep, simulationId })
      }

      const groups = await findManyGroupsBySimulationId({
        simulationId,
      })

      if (!userSession.isAuth) {
        return success({ groups, polls })
      }

      runSideEffect(
        'addOrUpdateContact',
        { logger, backgroundTaskRunner },
        () =>
          addOrUpdateContact({
            email: userSession.email,
            attributes: {
              [Attributes.USER_ID]: userId,
              [Attributes.LAST_SIMULATION_DATE]: simulation.date.toISOString(),
              ...mapComputedResultsToContactAttributes(computedResults, locale),
            },
          })
      )

      runSideEffect(
        'joinedEmail',
        { logger, backgroundTaskRunner },
        async () => {
          // The most recent membership is the one the user just completed.
          const lastPoll = polls[0]
          if (lastPoll) {
            return sendEmail(
              createPollJoinedEmail({
                organisation: lastPoll.organisation,
                simulationId,
                locale,
                origin,
                email: userSession.email,
                poll: lastPoll,
              })
            )
          }

          const lastGroup = groups[0]
          if (lastGroup) {
            const user = await findUserById(userId)
            invariant(user && user.email) // safe as retrieve by reliable ids
            const params = {
              group: lastGroup,
              origin,
              user,
            }

            return lastGroup.administratorId === userId
              ? sendEmail(createGroupCreatedEmail(params))
              : sendEmail(createGroupJoinedEmail(params))
          }

          return success()
        }
      )

      return success({
        groups,
        polls,
      })
    }
  )
}

/** Delays before each status read: 1s, then 500ms four times, then 1s twice —
 * one read after each delay, at 1s, 1.5s, 2s, 2.5s, 3s, 4s and 5s. */
const COMPUTATION_POLL_DELAYS_MS = [
  1000, 500, 500, 500, 500, 1000, 1000,
] as const

/**
 * Waits, bounded to 5 seconds, for the simulation's computation job to reach a
 * terminal status, so the completion response carries the rule evaluations the
 * job writes. Reads the computation row only through the repository's
 * find-by-simulation method, one read after each poll delay, and stops early
 * on `completed` or `failed`. When the cap is hit while the job is still
 * running, logs one warning with the simulation id and the last seen status
 * and returns normally: the completion proceeds anyway.
 */
const waitForSimulationComputation = async ({
  logger,
  sleep,
  simulationId,
}: {
  logger: Logger
  sleep: (ms: number) => Promise<void>
  simulationId: string
}): Promise<void> => {
  let lastSeenStatus: SimulationComputationStatus | null = null
  for (const delayMs of COMPUTATION_POLL_DELAYS_MS) {
    await sleep(delayMs)
    const computation = await findSimulationComputation(simulationId)
    lastSeenStatus = computation?.status ?? null
    if (lastSeenStatus === 'completed' || lastSeenStatus === 'failed') return
  }
  logger.warn(
    'Simulation computation unfinished after the 5s wait on completion',
    {
      simulationId,
      status: lastSeenStatus,
    }
  )
}
