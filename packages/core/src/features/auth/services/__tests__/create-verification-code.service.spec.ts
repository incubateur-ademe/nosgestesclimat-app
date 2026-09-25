import { faker } from '@faker-js/faker'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BackgroundTaskRunner } from '../../../../lib/background-task-runner.ts'
import { prisma } from '../../../../prisma/client.ts'
import { VerificationCodeUsage } from '../../../../prisma/generated/client.ts'
import {
  createVerificationCodeService,
  generateRandomVerificationCode,
} from '../create-verification-code.service.ts'

const sendVerificationCodeEmail = vi.fn()
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

  const createVerificationCode = createVerificationCodeService({
    logger,
    captureException,
    sendVerificationCodeEmail,
    backgroundTaskRunner,
  })

  beforeEach(() => {
    pendingTasks = []
  })

  afterEach(async () => {
    await flushBackgroundTasks()
    await prisma.verificationCode.deleteMany()
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
    const now = Date.now()

    await createVerificationCode({ email, locale: 'fr' })

    const createdVerificationCode = await prisma.verificationCode.findFirst({
      where: { email },
    })

    expect(createdVerificationCode).toMatchObject({
      id: expect.any(String),
      email,
      mode: null,
      usage: VerificationCodeUsage.login,
      expirationDate: expect.any(Date),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(createdVerificationCode?.code).toMatch(/^\d{6}$/)

    // Hopefully code gets created under 1 second
    expect(
      Math.floor(
        ((createdVerificationCode?.expirationDate.getTime() ?? 0) -
          now -
          ONE_HOUR_MS) /
          1000
      )
    ).toBe(0)
  })

  describe('And a custom usage', () => {
    it('Then it stores the code with the injected usage', async () => {
      const createApiTokenVerificationCode = createVerificationCodeService({
        logger,
        captureException,
        sendVerificationCodeEmail,
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
  })

  it('schedules the email with the generated code and the requested locale', async () => {
    const email = faker.internet.email().toLocaleLowerCase()

    await createVerificationCode({ email, locale: 'en' })

    const createdVerificationCode = await prisma.verificationCode.findFirst({
      where: { email },
    })

    await flushBackgroundTasks()

    expect(sendVerificationCodeEmail).toHaveBeenCalledTimes(1)
    expect(sendVerificationCodeEmail).toHaveBeenCalledWith({
      locale: 'en',
      email,
      code: createdVerificationCode?.code,
    })
  })

  it('commits the code before the email is scheduled', async () => {
    const email = faker.internet.email().toLocaleLowerCase()
    let codeRowAtScheduling: unknown

    const createVerificationCodeWithProbe = createVerificationCodeService({
      logger,
      captureException,
      sendVerificationCodeEmail,
      backgroundTaskRunner: (task) => {
        // The code must already exist in database when the email is handed
        // over to the runner.
        codeRowAtScheduling = prisma.verificationCode.findFirst({
          where: { email },
        })
        pendingTasks.push(task())
      },
    })

    await createVerificationCodeWithProbe({ email, locale: 'fr' })

    await expect(codeRowAtScheduling).resolves.toMatchObject({
      email,
    })
  })

  describe('And the email delivery fails', () => {
    it('Then it still persists the verification code and does not fail the creation', async () => {
      const email = faker.internet.email().toLocaleLowerCase()
      const emailError = new Error('Brevo timeout')
      sendVerificationCodeEmail.mockRejectedValueOnce(emailError)

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

    it('Then it logs and captures the exception', async () => {
      const email = faker.internet.email().toLocaleLowerCase()
      const emailError = new Error('Brevo timeout')
      sendVerificationCodeEmail.mockRejectedValueOnce(emailError)

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
})

describe('generateRandomVerificationCode', () => {
  it('generates a 6-digit code', () => {
    expect(generateRandomVerificationCode()).toMatch(/^\d{6}$/)
  })
})
