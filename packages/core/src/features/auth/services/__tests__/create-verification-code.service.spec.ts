import { faker } from '@faker-js/faker'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BackgroundTaskRunner } from '../../../../lib/background-task-runner.ts'
import { failure, success } from '../../../../lib/result.ts'
import { prisma } from '../../../../prisma/client.ts'
import { VerificationCodeUsage } from '../../../../prisma/generated/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { EmailRequestError } from '../../../emails/errors.ts'
import {
  createCreateVerificationCodeService,
  generateRandomVerificationCode,
} from '../create-verification-code.service.ts'

const sendEmail = vi.fn().mockResolvedValue(success())
const logger = { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() }
const captureException = vi.fn()

const ONE_HOUR_MS = 1000 * 60 * 60

describe('createVerificationCode', () => {
  let pendingTasks: Array<Promise<void>>

  const backgroundTaskRunner: BackgroundTaskRunner = (task) => {
    pendingTasks.push(task())
  }

  const flushBackgroundTasks = async () => {
    await Promise.all(pendingTasks)
    pendingTasks = []
  }

  const createVerificationCode = createCreateVerificationCodeService({
    logger,
    captureException,
    sendEmail,
    backgroundTaskRunner,
    usage: VerificationCodeUsage.login,
  })

  beforeEach(() => {
    pendingTasks = []
  })

  afterEach(async () => {
    await flushBackgroundTasks()
    await emptyDatabase(prisma)
    vi.clearAllMocks()
  })

  it('returns the created verification code without the code itself', async () => {
    const email = faker.internet.email().toLocaleLowerCase()

    const result = await createVerificationCode({ email, locale: 'fr' })

    expect(result).toEqual({
      email,
      expirationDate: expect.any(Date),
    })
  })

  it('stores a 6-digit verification code valid 1 hour in database', async () => {
    const email = faker.internet.email().toLocaleLowerCase()
    const startMs = Date.now()

    await createVerificationCode({ email, locale: 'fr' })

    const endMs = Date.now()

    const createdVerificationCode = await prisma.verificationCode.findFirst({
      where: { email },
    })

    expect(createdVerificationCode).not.toBeNull()
    expect(createdVerificationCode).toMatchObject({
      id: expect.any(String),
      email,
      usage: VerificationCodeUsage.login,
      expirationDate: expect.any(Date),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(createdVerificationCode?.code).toMatch(/^\d{6}$/)

    // The service computes the expiration date from Date.now() at the time
    // of the call, so it must land between "start + 1 hour" and "end + 1
    // hour", whatever how long the create took.
    const expirationMs = createdVerificationCode!.expirationDate.getTime()
    expect(expirationMs).toBeGreaterThanOrEqual(startMs + ONE_HOUR_MS)
    expect(expirationMs).toBeLessThanOrEqual(endMs + ONE_HOUR_MS)
  })

  it('stores the code with the injected custom usage', async () => {
    const createApiTokenVerificationCode = createCreateVerificationCodeService({
      logger,
      captureException,
      sendEmail,
      backgroundTaskRunner,
      usage: VerificationCodeUsage.apiToken,
    })

    const email = faker.internet.email().toLocaleLowerCase()

    await createApiTokenVerificationCode({ email, locale: 'fr' })

    await expect(
      prisma.verificationCode.findFirst({ where: { email } })
    ).resolves.toMatchObject({
      email,
      usage: VerificationCodeUsage.apiToken,
    })
  })

  it.each([
    { locale: 'en' as const, templateId: 125 },
    { locale: 'fr' as const, templateId: 66 },
  ])(
    'sends the email with the generated code and the requested locale ($locale)',
    async ({ locale, templateId }) => {
      const email = faker.internet.email().toLocaleLowerCase()

      await createVerificationCode({ email, locale })

      const createdVerificationCode = await prisma.verificationCode.findFirst({
        where: { email },
      })

      await flushBackgroundTasks()

      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith({
        email,
        templateId,
        params: {
          VERIFICATION_CODE: createdVerificationCode?.code,
        },
      })
    }
  )

  it('still persists the verification code and does not fail the creation when the email delivery fails', async () => {
    const email = faker.internet.email().toLocaleLowerCase()
    const emailError = new EmailRequestError('Brevo timeout')
    sendEmail.mockResolvedValueOnce(failure(emailError))

    await expect(
      createVerificationCode({ email, locale: 'fr' })
    ).resolves.toEqual({
      email,
      expirationDate: expect.any(Date),
    })

    await flushBackgroundTasks()

    // Brevo may well have delivered the message before failing us: the
    // email failure happens after the committed create, and the code must
    // stay in database, otherwise the user holds a code that can never work.
    await expect(
      prisma.verificationCode.findFirst({ where: { email } })
    ).resolves.toMatchObject({ email })
  })

  it('logs and captures the exception when the email delivery fails', async () => {
    const email = faker.internet.email().toLocaleLowerCase()
    const emailError = new EmailRequestError('Brevo timeout')
    sendEmail.mockResolvedValueOnce(failure(emailError))

    await createVerificationCode({ email, locale: 'fr' })

    await flushBackgroundTasks()

    expect(logger.error).toHaveBeenCalledWith(
      'Failed to send verification code email',
      { error: emailError }
    )
    // The address must never reach the logs in clear.
    expect(logger.error).not.toHaveBeenCalledWith(
      'Failed to send verification code email',
      expect.objectContaining({ email })
    )
    expect(captureException).toHaveBeenCalledWith(emailError)
  })
})

describe('generateRandomVerificationCode', () => {
  it('generates a 6-digit code', () => {
    expect(generateRandomVerificationCode()).toMatch(/^\d{6}$/)
  })
})
