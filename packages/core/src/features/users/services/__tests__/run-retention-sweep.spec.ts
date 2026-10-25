import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { failure, success } from '../../../../lib/result.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { TemplateIds } from '../../../emails/email.constant.ts'
import { EmailRequestError } from '../../../emails/errors.ts'
import type { SendEmail } from '../../../emails/types.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { userFactory } from '../../factories/user.factory.ts'
import { createRunRetentionSweep } from '../run-retention-sweep.service.ts'

const logger = createTestLogger()
const sendEmail = vi.fn<SendEmail>()

/** The sweep takes "now" as a parameter, so its windows are set in the
 * fixtures rather than waited for. */
const now = new Date('2026-10-15T06:00:00.000Z')

// Worked out from `now` by hand, so the expectations do not lean on the code
// they check: erasure comes at 24 months idle, the retention notice 3 months
// before it, the final one 7 days before it.
/** 22 months idle: the retention notice is due, the final one is not. */
const retentionNoticeDueDate = new Date('2024-12-15T06:00:00.000Z')
/** Five days behind it: the retention notice is due here too. */
const laterRetentionNoticeAlsoDueDate = new Date('2024-12-20T06:00:00.000Z')
/** Five days short of erasure: the final notice is due. */
const finalNoticeDueDate = new Date('2024-10-20T06:00:00.000Z')
/** Nine months idle: no notice is due. */
const nothingDueYetDate = new Date('2026-01-15T06:00:00.000Z')

/** The newest activity still due the retention notice: 21 months of idle. */
const newestActivityStillDueDate = new Date('2025-01-15T06:00:00.000Z')
/** One day newer, so one day too recent for the notice. */
const oneDayTooRecentForTheNoticeDate = new Date('2025-01-16T06:00:00.000Z')

/** The run that first finds an account due the final notice. */
const finalNoticeFirstDueDate = new Date('2026-12-08T06:00:00.000Z')

describe('runRetentionSweep', () => {
  beforeEach(() => {
    sendEmail.mockResolvedValue(success())
  })

  afterEach(async () => {
    await emptyDatabase(prisma)
    vi.clearAllMocks()
  })

  describe('Given an account whose inactivity reaches a notice window', () => {
    it('sends the retention notice three months before erasure', async () => {
      const account = await seedAccount({
        lastActivityAt: retentionNoticeDueDate,
      })

      await runSweep()

      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith({
        email: account.email,
        templateId: TemplateIds.fr.RETENTION_NOTICE,
        params: { DELETION_DATE: '14 décembre 2026' },
      })
    })

    it('sends the final notice one week before erasure', async () => {
      const account = await seedAccount({
        lastActivityAt: finalNoticeDueDate,
      })

      await runSweep()

      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith({
        email: account.email,
        templateId: TemplateIds.fr.FINAL_RETENTION_NOTICE,
        params: { DELETION_DATE: '19 octobre 2026' },
      })
    })

    it('stamps the notice it sent', async () => {
      const account = await seedAccount({
        lastActivityAt: retentionNoticeDueDate,
      })

      await runSweep()

      expect(await noticeStamps(account.id)).toEqual({
        retentionNoticeSentAt: now,
        finalNoticeSentAt: null,
      })
    })

    it('leaves an account inside the retention period alone', async () => {
      await seedAccount({ lastActivityAt: nothingDueYetDate })

      await runSweep()

      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('never notices an account whose activity date is unknown', async () => {
      // The activity clock is backfilled by a separate, one-shot script: until
      // it has run, an account with no date is one we know nothing about.
      await seedAccount({ lastActivityAt: null })

      await runSweep()

      expect(sendEmail).not.toHaveBeenCalled()
    })
  })

  describe('Given the notice windows', () => {
    it('notices the account on the day it enters the window, not the day after', async () => {
      const notified = await seedAccount({
        lastActivityAt: newestActivityStillDueDate,
      })
      await seedAccount({ lastActivityAt: oneDayTooRecentForTheNoticeDate })

      await runSweep()

      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: notified.email })
      )
    })

    it('clamps the cutoff to the last day of a shorter month', async () => {
      /** The sweep runs on the 31st; 21 months back, June ends a day earlier. */
      const thirtyFirstSweepDate = new Date('2026-03-31T06:00:00.000Z')
      /** Clamped to June's length, this activity is exactly old enough. */
      const just3MonthsBeforeDeletionDate = new Date('2024-06-30T06:00:00.000Z')
      /** An unclamped shift puts the cutoff here instead, one day too late. */
      const oneDayTooRecentDate = new Date('2024-07-01T06:00:00.000Z')

      const notified = await seedAccount({
        lastActivityAt: just3MonthsBeforeDeletionDate,
      })
      await seedAccount({ lastActivityAt: oneDayTooRecentDate })

      await runSweep({ now: thirtyFirstSweepDate })

      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: notified.email })
      )
    })
  })

  describe('Given an account already noticed in this inactivity period', () => {
    it('sends nothing on a repeat run', async () => {
      await seedAccount({ lastActivityAt: retentionNoticeDueDate })

      await runSweep()
      await runSweep()

      expect(sendEmail).toHaveBeenCalledTimes(1)
    })

    it('sends the final notice once the account reaches it', async () => {
      const account = await seedAccount({
        lastActivityAt: retentionNoticeDueDate,
      })

      await runSweep()
      await runSweep({ now: finalNoticeFirstDueDate })

      expect(sendEmail).toHaveBeenCalledTimes(2)
      expect(sendEmail).toHaveBeenLastCalledWith(
        expect.objectContaining({
          email: account.email,
          templateId: TemplateIds.fr.FINAL_RETENTION_NOTICE,
        })
      )
    })
  })

  describe('Given a noticed account becomes active again', () => {
    it('stops noticing it, and warns it again the next time it goes idle', async () => {
      const account = await seedAccount({
        lastActivityAt: retentionNoticeDueDate,
      })

      await runSweep()

      const cameBackDate = new Date('2026-10-17T06:00:00.000Z')
      await prisma.user.update({
        where: { id: account.id },
        data: { lastActivityAt: cameBackDate },
      })

      await runSweep()
      expect(sendEmail).toHaveBeenCalledTimes(1)

      /** 21 months after the account came back: its window opens again. */
      const idleAgainDate = new Date('2028-07-17T06:00:00.000Z')
      await runSweep({ now: idleAgainDate })

      expect(sendEmail).toHaveBeenCalledTimes(2)
    })
  })

  describe('Given the language the account uses the site in', () => {
    /** Two writes months apart: the sweep reads the language of the last one. */
    const firstWriteDate = new Date('2024-01-01T00:00:00.000Z')
    const lastWriteDate = new Date('2024-06-01T00:00:00.000Z')

    it('writes the notice in the language of its last simulation', async () => {
      const inEnglish = await seedAccount({
        lastActivityAt: retentionNoticeDueDate,
      })
      await seedSimulation({
        userId: inEnglish.id,
        locale: 'fr',
        at: firstWriteDate,
      })
      await seedSimulation({
        userId: inEnglish.id,
        locale: 'en',
        at: lastWriteDate,
      })

      const inFrench = await seedAccount({
        lastActivityAt: retentionNoticeDueDate,
      })
      await seedSimulation({
        userId: inFrench.id,
        locale: 'en',
        at: firstWriteDate,
      })
      await seedSimulation({
        userId: inFrench.id,
        locale: 'fr',
        at: lastWriteDate,
      })

      await runSweep()

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: inEnglish.email,
          templateId: TemplateIds.en.RETENTION_NOTICE,
        })
      )
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: inFrench.email,
          templateId: TemplateIds.fr.RETENTION_NOTICE,
        })
      )
    })

    it('carries it to the final notice too', async () => {
      // The two windows are two queries: each reads the language itself.
      const account = await seedAccount({
        lastActivityAt: finalNoticeDueDate,
      })
      await seedSimulation({
        userId: account.id,
        locale: 'en',
        at: lastWriteDate,
      })

      await runSweep()

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: account.email,
          templateId: TemplateIds.en.FINAL_RETENTION_NOTICE,
        })
      )
    })

    it('reads the last write, not the last creation', async () => {
      const account = await seedAccount({
        lastActivityAt: retentionNoticeDueDate,
      })
      // An old simulation, recomputed since in English, and a recent French one.
      const inEnglishWrittenFirstDate = new Date('2023-01-01T00:00:00.000Z')
      const inEnglishRecomputedDate = new Date('2024-09-01T00:00:00.000Z')
      await simulationFactory.withModelLocale('en').create({
        userId: account.id,
        date: inEnglishWrittenFirstDate,
        createdAt: inEnglishWrittenFirstDate,
        updatedAt: inEnglishRecomputedDate,
      })
      await simulationFactory.withModelLocale('fr').create({
        userId: account.id,
        date: lastWriteDate,
        createdAt: lastWriteDate,
        updatedAt: lastWriteDate,
      })

      await runSweep()

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: account.email,
          templateId: TemplateIds.en.RETENTION_NOTICE,
        })
      )
    })

    it('falls back to French for an account that never simulated', async () => {
      const account = await seedAccount({
        lastActivityAt: retentionNoticeDueDate,
      })

      await runSweep()

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: account.email,
          templateId: TemplateIds.fr.RETENTION_NOTICE,
        })
      )
    })
  })

  describe('Given a dry run', () => {
    it('reports what it would notice without sending or writing', async () => {
      const account = await seedAccount({
        lastActivityAt: retentionNoticeDueDate,
      })

      await runSweep({ dryRun: true })

      expect(sendEmail).not.toHaveBeenCalled()
      expect(await noticeStamps(account.id)).toEqual({
        retentionNoticeSentAt: null,
        finalNoticeSentAt: null,
      })
      expect(logger.info).toHaveBeenCalledWith('Retention sweep finished', {
        dryRun: true,
        selected: {
          'retention-notice': 1,
          'final-notice': 0,
        },
        sent: 0,
        failed: 0,
      })
      expect(logger.debug).toHaveBeenCalledWith('Retention notices selected', {
        stage: 'retention-notice',
        userIds: [account.id],
      })
    })
  })

  describe('Given a send fails part way through the run', () => {
    it('notices the other accounts and retries the failed one on the next run', async () => {
      const failing = await seedAccount({
        lastActivityAt: retentionNoticeDueDate,
      })
      const passing = await seedAccount({
        lastActivityAt: laterRetentionNoticeAlsoDueDate,
      })

      sendEmail.mockImplementation(({ email }) =>
        Promise.resolve(
          email === failing.email
            ? failure(new EmailRequestError('Brevo is down'))
            : success()
        )
      )

      await runSweep()

      expect(logger.error).toHaveBeenCalledWith(expect.any(EmailRequestError), {
        userId: failing.id,
        stage: 'retention-notice',
      })
      expect(logger.info).toHaveBeenCalledWith('Retention sweep finished', {
        dryRun: false,
        selected: {
          'retention-notice': 2,
          'final-notice': 0,
        },
        sent: 1,
        failed: 1,
      })
      expect(await noticeStamps(passing.id)).toEqual({
        retentionNoticeSentAt: now,
        finalNoticeSentAt: null,
      })
      expect(await noticeStamps(failing.id)).toEqual({
        retentionNoticeSentAt: null,
        finalNoticeSentAt: null,
      })

      sendEmail.mockResolvedValue(success())
      await runSweep()

      expect(sendEmail).toHaveBeenCalledTimes(3)
      expect(sendEmail).toHaveBeenLastCalledWith(
        expect.objectContaining({ email: failing.email })
      )
      expect(await noticeStamps(failing.id)).toEqual({
        retentionNoticeSentAt: now,
        finalNoticeSentAt: null,
      })
    })
  })

  describe('Given a send throws', () => {
    it('notices the other accounts', async () => {
      const throwing = await seedAccount({
        lastActivityAt: retentionNoticeDueDate,
      })
      const passing = await seedAccount({
        lastActivityAt: laterRetentionNoticeAlsoDueDate,
      })

      sendEmail.mockImplementation(({ email }) =>
        email === throwing.email
          ? Promise.reject(new Error('Brevo exploded'))
          : Promise.resolve(success())
      )

      await runSweep()

      expect(logger.error).toHaveBeenCalledWith(expect.any(Error), {
        userId: throwing.id,
        stage: 'retention-notice',
      })
      expect(await noticeStamps(passing.id)).toEqual({
        retentionNoticeSentAt: now,
        finalNoticeSentAt: null,
      })
      expect(await noticeStamps(throwing.id)).toEqual({
        retentionNoticeSentAt: null,
        finalNoticeSentAt: null,
      })
    })
  })
})

const seedAccount = ({ lastActivityAt }: { lastActivityAt: Date | null }) =>
  userFactory.verified().params({ lastActivityAt }).create()

const seedSimulation = ({
  userId,
  locale,
  at,
}: {
  userId: string
  locale: 'fr' | 'en'
  at: Date
}) =>
  simulationFactory
    .withModelLocale(locale)
    // The sweep reads the language of the account's last *write*, and the
    // factory stamps `updatedAt` with the current time.
    .create({ userId, createdAt: at, updatedAt: at, date: at })

const runSweep = ({
  now: at = now,
  dryRun = false,
}: {
  now?: Date
  dryRun?: boolean
} = {}) => createRunRetentionSweep({ logger, sendEmail })({ now: at, dryRun })

const noticeStamps = (userId: string) =>
  prisma.user.findFirst({
    where: { id: userId },
    select: { retentionNoticeSentAt: true, finalNoticeSentAt: true },
  })
