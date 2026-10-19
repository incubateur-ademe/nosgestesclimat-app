import type { Transaction } from '../../../lib/transaction.ts'
import type { SendEmail } from '../../emails/types.ts'
import type { Logger } from '../../logger/index.ts'
import { createRetentionNoticeEmail } from '../emails/retention-emails.ts'
import { erasureDate } from '../helpers/retention-period.ts'
import {
  findAccountsDueForFinalNotice,
  findAccountsDueForRetentionNotice,
  stampRetentionNotice,
} from '../repositories/retention.repository.ts'
import type {
  RetentionNoticeCandidate,
  RetentionNoticeStage,
} from '../types/retention.ts'

/** Warns the accounts a notice is due to, and logs what the run did. */
export const runRetentionSweep = ({
  session,
  now,
  dryRun,
  sendEmail,
  logger,
}: {
  session: Transaction
  /** The sweep never reads the clock: an injected instant makes the windows
   * reviewable and the runs reproducible. */
  now: Date
  /** Selects and reports without sending or stamping. */
  dryRun: boolean
  sendEmail: SendEmail
  logger: Logger
}): Promise<void> =>
  logger.withSpan('core.service.runRetentionSweep', async ({ logger }) => {
    // Both windows are read before anything goes out: a failed read fails the run.
    const [retention, final] = await Promise.all([
      findAccountsDueForRetentionNotice({ now }, { session }),
      findAccountsDueForFinalNotice({ now }, { session }),
    ])

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
      // On demand: a wave can hold thousands of them, and they are what a dry
      // run is inspected on.
      logger.debug('Retention notices selected', {
        stage,
        userIds: accounts.map((account) => account.userId),
      })

      for (const account of accounts) {
        if (dryRun) continue

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

        await stampRetentionNotice(
          { userId: account.userId, stage, at: now },
          { session }
        )
        sent++
      }
    }

    await notify('retention-notice', retention)
    await notify('final-notice', final)

    logger.info('Retention sweep finished', {
      dryRun,
      selected: {
        'retention-notice': retention.length,
        'final-notice': final.length,
      },
      sent,
      failed,
    })
  })()
