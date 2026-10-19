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
import { runRetentionSweep } from '../run-retention-sweep.service.ts'

const logger = createTestLogger()
const sendEmail = vi.fn<SendEmail>()

/** The sweep takes "now" as a parameter, so its windows are set in the
 * fixtures rather than waited for. */
const now = new Date('2026-10-15T06:00:00.000Z')

const seedAccount = async ({
  lastActivityAt,
}: {
  lastActivityAt: Date | null
}) => {
  const account = await userFactory.verified().create()

  await prisma.user.update({
    where: { id: account.id },
    data: { lastActivityAt },
  })

  return account
}

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
  at = now,
  dryRun = false,
}: {
  at?: Date
  dryRun?: boolean
} = {}) =>
  runRetentionSweep({ session: prisma, now: at, dryRun, sendEmail, logger })

const noticeStamps = (userId: string) =>
  prisma.user.findFirst({
    where: { id: userId },
    select: { retentionNoticeSentAt: true, finalNoticeSentAt: true },
  })

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
      // Twenty-two months: inside the three months that precede erasure.
      const account = await seedAccount({
        lastActivityAt: new Date('2024-12-15T06:00:00.000Z'),
      })

      await runSweep()

      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith({
        email: account.email,
        templateId: TemplateIds.fr.RETENTION_NOTICE,
        params: { DELETION_DATE: '2026-12-15' },
      })
    })

    it('sends the final notice one week before erasure', async () => {
      // Erasure falls in five days: past the retention notice, inside the week.
      const account = await seedAccount({
        lastActivityAt: new Date('2024-10-20T06:00:00.000Z'),
      })

      await runSweep()

      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith({
        email: account.email,
        templateId: TemplateIds.fr.FINAL_RETENTION_NOTICE,
        params: { DELETION_DATE: '2026-10-20' },
      })
    })

    it('stamps the notice it sent', async () => {
      const account = await seedAccount({
        lastActivityAt: new Date('2024-12-15T06:00:00.000Z'),
      })

      await runSweep()

      expect(await noticeStamps(account.id)).toEqual({
        retentionNoticeSentAt: now,
        finalNoticeSentAt: null,
      })
    })

    it('leaves an account inside the retention period alone', async () => {
      await seedAccount({
        lastActivityAt: new Date('2026-01-15T06:00:00.000Z'),
      })

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
      const entering = await seedAccount({
        lastActivityAt: new Date('2025-01-15T06:00:00.000Z'),
      })
      await seedAccount({
        lastActivityAt: new Date('2025-01-15T06:00:00.001Z'),
      })

      await runSweep()

      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: entering.email })
      )
    })

    it('counts whole calendar months, clamping on shorter ones', async () => {
      const at = new Date('2026-03-31T06:00:00.000Z')
      const entered = await seedAccount({
        lastActivityAt: new Date('2024-06-30T06:00:00.000Z'),
      })
      await seedAccount({
        lastActivityAt: new Date('2024-07-01T06:00:00.000Z'),
      })

      await runSweep({ at })

      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: entered.email })
      )
    })
  })

  describe('Given an account already noticed in this inactivity period', () => {
    it('sends nothing on a repeat run', async () => {
      await seedAccount({
        lastActivityAt: new Date('2024-12-15T06:00:00.000Z'),
      })

      await runSweep()
      await runSweep()

      expect(sendEmail).toHaveBeenCalledTimes(1)
    })

    it('sends the final notice once the account reaches it', async () => {
      const account = await seedAccount({
        lastActivityAt: new Date('2024-12-15T06:00:00.000Z'),
      })

      await runSweep()
      // Three months later, the erasure is a week away.
      await runSweep({ at: new Date('2027-03-18T06:00:00.000Z') })

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
      const inactiveSince = new Date('2024-12-15T06:00:00.000Z')
      const account = await seedAccount({ lastActivityAt: inactiveSince })

      await runSweep()

      // The account comes back two days after the notice.
      const activityAt = new Date('2026-10-17T06:00:00.000Z')
      await prisma.user.update({
        where: { id: account.id },
        data: { lastActivityAt: activityAt },
      })

      await runSweep()
      expect(sendEmail).toHaveBeenCalledTimes(1)

      await runSweep({ at: new Date('2028-07-17T06:00:00.000Z') })

      expect(sendEmail).toHaveBeenCalledTimes(2)
    })
  })

  describe('Given the language the account uses the site in', () => {
    it('writes the notice in the language of its last simulation', async () => {
      const inEnglish = await seedAccount({
        lastActivityAt: new Date('2024-12-15T06:00:00.000Z'),
      })
      await seedSimulation({
        userId: inEnglish.id,
        locale: 'fr',
        at: new Date('2024-01-01T00:00:00.000Z'),
      })
      await seedSimulation({
        userId: inEnglish.id,
        locale: 'en',
        at: new Date('2024-06-01T00:00:00.000Z'),
      })

      const inFrench = await seedAccount({
        lastActivityAt: new Date('2024-12-15T06:00:00.000Z'),
      })
      await seedSimulation({
        userId: inFrench.id,
        locale: 'en',
        at: new Date('2024-01-01T00:00:00.000Z'),
      })
      await seedSimulation({
        userId: inFrench.id,
        locale: 'fr',
        at: new Date('2024-06-01T00:00:00.000Z'),
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
        lastActivityAt: new Date('2024-10-20T06:00:00.000Z'),
      })
      await seedSimulation({
        userId: account.id,
        locale: 'en',
        at: new Date('2024-06-01T00:00:00.000Z'),
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
        lastActivityAt: new Date('2024-12-15T06:00:00.000Z'),
      })
      // An old simulation, recomputed since in English, and a recent French one.
      await simulationFactory.withModelLocale('en').create({
        userId: account.id,
        date: new Date('2023-01-01T00:00:00.000Z'),
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-09-01T00:00:00.000Z'),
      })
      await simulationFactory.withModelLocale('fr').create({
        userId: account.id,
        date: new Date('2024-06-01T00:00:00.000Z'),
        createdAt: new Date('2024-06-01T00:00:00.000Z'),
        updatedAt: new Date('2024-06-01T00:00:00.000Z'),
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
        lastActivityAt: new Date('2024-12-15T06:00:00.000Z'),
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

  describe('Given an account that was already erased', () => {
    it('never notices it', async () => {
      // Erasure strips the verified record and the mirrored email.
      const erased = await userFactory.unverified().create()
      await prisma.user.update({
        where: { id: erased.id },
        data: { lastActivityAt: new Date('2024-01-01T06:00:00.000Z') },
      })

      await runSweep()

      expect(sendEmail).not.toHaveBeenCalled()
    })
  })

  describe('Given a dry run', () => {
    it('reports what it would notice without sending or writing', async () => {
      const account = await seedAccount({
        lastActivityAt: new Date('2024-12-15T06:00:00.000Z'),
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
        lastActivityAt: new Date('2024-12-15T06:00:00.000Z'),
      })
      const passing = await seedAccount({
        lastActivityAt: new Date('2024-12-20T06:00:00.000Z'),
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
})
