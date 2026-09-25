import { Attributes, TemplateIds } from '../../emails/email.constant.ts'
import type { AddOrUpdateContact, SendEmail } from '../../emails/types.ts'
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

type AddOrUpdateContactAfterLoginParams = Readonly<{
  email: string
  userId: string
}>

// The email senders return a Result instead of throwing: rethrow the error so
// the scheduling services' try/catch (logger.error + captureException)
// observes a failing email.
const assertEmailResult = (result: Awaited<ReturnType<SendEmail>>) => {
  if (!result.success) {
    throw result.error
  }
}

export const createSendVerificationCodeEmail =
  (sendEmail: SendEmail) =>
  async ({
    locale,
    email,
    code,
  }: VerificationCodeEmailParams): Promise<void> => {
    const result = await sendEmail({
      email,
      templateId: TemplateIds[locale].VERIFICATION_CODE,
      params: {
        VERIFICATION_CODE: code,
      },
    })

    assertEmailResult(result)
  }

export const createSendWelcomeEmail =
  (sendEmail: SendEmail) =>
  async ({ locale, email, origin }: WelcomeEmailParams): Promise<void> => {
    const dashboardUrl = new URL(`${origin}/mon-espace`)

    const result = await sendEmail({
      email,
      templateId: TemplateIds[locale].SIGN_UP,
      params: {
        DASHBOARD_URL: dashboardUrl.toString(),
      },
    })

    assertEmailResult(result)
  }

export const createAddOrUpdateContactAfterLogin =
  (addOrUpdateContact: AddOrUpdateContact) =>
  async ({
    email,
    userId,
  }: AddOrUpdateContactAfterLoginParams): Promise<void> => {
    const attributes = {
      [Attributes.USER_ID]: userId,
    }

    const result = await addOrUpdateContact({
      email,
      attributes,
    })

    assertEmailResult(result)
  }
