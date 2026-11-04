import { toError } from '../../../lib/to-error.ts'
import type { SendEmail } from '../../emails/types.ts'
import type { Logger } from '../../logger/index.ts'
import { createRetentionNoticeEmail } from '../emails/retention-emails.ts'
import { ErasureWithoutFinalNoticeError } from '../errors/erasure-without-final-notice.error.ts'
import { erasureDate } from '../helpers/retention-period.ts'
import {
  findAccountsDueForErasure,
  findAccountsDueForFinalNotice,
  findAccountsDueForRetentionNotice,
  updateRetentionNotice,
} from '../repositories/retention.repository.ts'
import type {
  ErasureCandidate,
  RetentionNoticeCandidate,
  RetentionNoticeStage,
  RetentionNoticeStamp,
} from '../types/retention.ts'
import { eraseUser } from './erase-user.service.ts'

interface RetentionSweepDependencies {
  logger: Logger
  sendEmail: SendEmail
}

type RetentionSweepParams = {
  /** The sweep never reads the clock: an injected instant makes the windows
   * reviewable and the runs reproducible. */
  now: Date
  /** Selects and reports without sending, stamping or erasing. */
  dryRun: boolean
  logger: Logger
}

const stampOf = (
  stage: RetentionNoticeStage,
  at: Date
): RetentionNoticeStamp =>
  stage === 'final-notice'
    ? { finalNoticeSentAt: at }
    : { retentionNoticeSentAt: at }

/** Warns the accounts a notice is due to, erases the ones past the retention
 * period, and logs what the run did. */
export const createRunRetentionSweep = ({
  logger,
  sendEmail,
}: RetentionSweepDependencies) =>
  logger.withSpan(
    'core.service.runRetentionSweep',
    async ({ now, dryRun, logger }: RetentionSweepParams) => {
      /**
       * Erases each account in turn. The erasure is one transaction, so a
       * failure leaves that account untouched and the next run retries it.
       */
      const erase = async (accounts: ErasureCandidate[]) => {
        // On demand: a wave can hold thousands of them.
        logger.debug('Accounts due for erasure selected', {
          userIds: accounts.map((account) => account.userId),
        })

        let erased = 0
        let failed = 0

        for (const account of accounts) {
          if (dryRun) continue

          try {
            await eraseUser(account.userId)
            erased++
          } catch (error) {
            logger.error(toError(error), {
              userId: account.userId,
            })
            failed++
          }
        }

        return { erased, failed }
      }

      // Every window is read before anything goes out: a failed read fails the run.
      const [dueForErasure, retentionDue, finalDue] = await Promise.all([
        findAccountsDueForErasure({ now }),
        findAccountsDueForRetentionNotice({ now }),
        findAccountsDueForFinalNotice({ now }),
      ])

      // The retention-notice window ends before the erasure one starts: only the
      // final notice overlaps, and what it holds there is erased unwarned.
      const erasedUserIds = new Set(dueForErasure.map(({ userId }) => userId))
      const { erasedAndUnwarned = [], finalToNotify = [] } = Object.groupBy(
        finalDue,
        ({ userId }) =>
          erasedUserIds.has(userId) ? 'erasedAndUnwarned' : 'finalToNotify'
      )

      // An account erased without its final notice means the sweep missed a
      // run, or the send failed: the erasure is not blocked on it, but it
      // needs a look.
      if (erasedAndUnwarned.length > 0) {
        logger.error(new ErasureWithoutFinalNoticeError(), {
          userIds: erasedAndUnwarned.map(({ userId }) => userId),
        })
      }

      let sent = 0
      let failed = 0

      /**
       * Sends each account the notice it is owed, then stamps it — after the send,
       * so an account whose send failed stays due and the next run retries it.
       */
      const notify = async (
        stage: RetentionNoticeStage,
        accounts: RetentionNoticeCandidate[]
      ) => {
        // On demand: a wave can hold thousands of them.
        logger.debug('Retention notices selected', {
          stage,
          userIds: accounts.map((account) => account.userId),
        })

        for (const account of accounts) {
          if (dryRun) continue

          try {
            const result = await sendEmail(
              createRetentionNoticeEmail({
                locale: account.locale,
                email: account.email,
                stage,
                deletionAt: erasureDate(account.lastActivityAt),
              })
            )

            if (!result.success) {
              logger.error(result.error, { userId: account.userId, stage })
              failed++
              continue
            }

            await updateRetentionNotice({
              userId: account.userId,
              data: stampOf(stage, now),
            })
            sent++
          } catch (error) {
            logger.error(toError(error), { userId: account.userId, stage })
            failed++
          }
        }
      }

      await notify('retention-notice', retentionDue)
      await notify('final-notice', finalToNotify)

      const erasure = await erase(dueForErasure)

      logger.info('Retention sweep finished', {
        dryRun,
        selected: {
          'retention-notice': retentionDue.length,
          'final-notice': finalToNotify.length,
          erasure: dueForErasure.length,
        },
        sent,
        failed,
        erased: erasure.erased,
        erasureFailed: erasure.failed,
      })
    }
  )
