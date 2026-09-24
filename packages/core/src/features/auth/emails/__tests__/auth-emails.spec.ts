import { describe, expect, it, vi } from 'vitest'
import { failure, success } from '../../../../lib/result.ts'
import { EmailRequestError } from '../../../emails/errors.ts'
import {
  createAddOrUpdateContactAfterLogin,
  createSendVerificationCodeEmail,
  createSendWelcomeEmail,
} from '../auth-emails.ts'

const mockSendEmail = vi.fn()
const mockAddOrUpdateContact = vi.fn()

const sendVerificationCodeEmail = createSendVerificationCodeEmail(mockSendEmail)
const sendWelcomeEmail = createSendWelcomeEmail(mockSendEmail)
const addOrUpdateContactAfterLogin = createAddOrUpdateContactAfterLogin(
  mockAddOrUpdateContact
)

describe('sendVerificationCodeEmail', () => {
  it('sends the verification code email with the French template', async () => {
    mockSendEmail.mockResolvedValueOnce(success())

    await sendVerificationCodeEmail({
      locale: 'fr',
      email: 'user@example.fr',
      code: '123456',
    })

    expect(mockSendEmail).toHaveBeenCalledWith({
      email: 'user@example.fr',
      templateId: 66,
      params: {
        VERIFICATION_CODE: '123456',
      },
    })
  })

  it('sends the verification code email with the English template', async () => {
    mockSendEmail.mockResolvedValueOnce(success())

    await sendVerificationCodeEmail({
      locale: 'en',
      email: 'user@example.fr',
      code: '654321',
    })

    expect(mockSendEmail).toHaveBeenCalledWith({
      email: 'user@example.fr',
      templateId: 125,
      params: {
        VERIFICATION_CODE: '654321',
      },
    })
  })

  it('throws when the email request fails', async () => {
    const emailRequestError = new EmailRequestError()
    mockSendEmail.mockResolvedValueOnce(failure(emailRequestError))

    await expect(
      sendVerificationCodeEmail({
        locale: 'fr',
        email: 'user@example.fr',
        code: '123456',
      })
    ).rejects.toThrow(emailRequestError)
  })
})

describe('sendWelcomeEmail', () => {
  it('sends the welcome email with the French template and the dashboard URL', async () => {
    mockSendEmail.mockResolvedValueOnce(success())

    await sendWelcomeEmail({
      locale: 'fr',
      email: 'user@example.fr',
      origin: 'https://nosgestesclimat.fr',
    })

    expect(mockSendEmail).toHaveBeenCalledWith({
      email: 'user@example.fr',
      templateId: 137,
      params: {
        DASHBOARD_URL: 'https://nosgestesclimat.fr/mon-espace',
      },
    })
  })

  it('sends the welcome email with the English template', async () => {
    mockSendEmail.mockResolvedValueOnce(success())

    await sendWelcomeEmail({
      locale: 'en',
      email: 'user@example.fr',
      origin: 'https://nosgestesclimat.fr',
    })

    expect(mockSendEmail).toHaveBeenCalledWith({
      email: 'user@example.fr',
      templateId: 139,
      params: {
        DASHBOARD_URL: 'https://nosgestesclimat.fr/mon-espace',
      },
    })
  })

  it('throws when the email request fails', async () => {
    const emailRequestError = new EmailRequestError()
    mockSendEmail.mockResolvedValueOnce(failure(emailRequestError))

    await expect(
      sendWelcomeEmail({
        locale: 'fr',
        email: 'user@example.fr',
        origin: 'https://nosgestesclimat.fr',
      })
    ).rejects.toThrow(emailRequestError)
  })
})

describe('addOrUpdateContactAfterLogin', () => {
  it('upserts the contact with the USER_ID attribute', async () => {
    mockAddOrUpdateContact.mockResolvedValueOnce(success())

    await addOrUpdateContactAfterLogin({
      email: 'user@example.fr',
      userId: 'user-id',
    })

    expect(mockAddOrUpdateContact).toHaveBeenCalledWith({
      email: 'user@example.fr',
      attributes: {
        USER_ID: 'user-id',
      },
    })
  })

  it('throws when the contact request fails', async () => {
    const emailRequestError = new EmailRequestError()
    mockAddOrUpdateContact.mockResolvedValueOnce(failure(emailRequestError))

    await expect(
      addOrUpdateContactAfterLogin({
        email: 'user@example.fr',
        userId: 'user-id',
      })
    ).rejects.toThrow(emailRequestError)
  })
})
