import { TemplateIds } from '../../emails/email.constant.ts'
import type { Email } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'

type VerificationCodeEmailParams = Readonly<{
  locale: ISOSupportedLanguage
  email: string
  code: string
}>

type WelcomeEmailParams = Readonly<{
  locale: ISOSupportedLanguage
  email: string
  origin: string
}>

export const createVerificationCodeEmail = ({
  locale,
  email,
  code,
}: VerificationCodeEmailParams): Email => ({
  email,
  templateId: TemplateIds[locale].VERIFICATION_CODE,
  params: {
    VERIFICATION_CODE: code,
  },
})

export const createWelcomeEmail = ({
  locale,
  email,
  origin,
}: WelcomeEmailParams): Email => {
  const dashboardUrl = new URL(`${origin}/mon-espace`)

  return {
    email,
    templateId: TemplateIds[locale].SIGN_UP,
    params: {
      DASHBOARD_URL: dashboardUrl.toString(),
    },
  }
}
