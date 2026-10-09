import { describe, expect, it } from 'vitest'
import {
  createVerificationCodeEmail,
  createWelcomeEmail,
} from '../auth-emails.ts'

describe('createVerificationCodeEmail', () => {
  it('builds the verification code email with the French template', () => {
    expect(
      createVerificationCodeEmail({
        locale: 'fr',
        email: 'user@example.fr',
        code: '123456',
      })
    ).toEqual({
      email: 'user@example.fr',
      templateId: 66,
      params: {
        VERIFICATION_CODE: '123456',
      },
    })
  })

  it('builds the verification code email with the English template', () => {
    expect(
      createVerificationCodeEmail({
        locale: 'en',
        email: 'user@example.fr',
        code: '654321',
      })
    ).toEqual({
      email: 'user@example.fr',
      templateId: 125,
      params: {
        VERIFICATION_CODE: '654321',
      },
    })
  })
})

describe('createWelcomeEmail', () => {
  it('builds the welcome email with the French template and the dashboard URL', () => {
    expect(
      createWelcomeEmail({
        locale: 'fr',
        email: 'user@example.fr',
        origin: 'https://nosgestesclimat.fr',
      })
    ).toEqual({
      email: 'user@example.fr',
      templateId: 137,
      params: {
        DASHBOARD_URL: 'https://nosgestesclimat.fr/mon-espace',
      },
    })
  })

  it('builds the welcome email with the English template', () => {
    expect(
      createWelcomeEmail({
        locale: 'en',
        email: 'user@example.fr',
        origin: 'https://nosgestesclimat.fr',
      })
    ).toEqual({
      email: 'user@example.fr',
      templateId: 139,
      params: {
        DASHBOARD_URL: 'https://nosgestesclimat.fr/mon-espace',
      },
    })
  })
})
