'use server'

import type { ListIds } from '@/helpers/server/model/newsletter'
import {
  NEWSLETTER_IDS,
  updateNewsletterSubscription,
} from '@/helpers/server/model/newsletter'
import { getUserSession } from '@/services/auth/get-user-session'
import { isEmailValid } from '@/utils/isEmailValid'
import { captureException } from '@sentry/nextjs'

export interface NewsletterFormState {
  email: string
  listIds: ListIds
  error?: 'EMAIL_INVALID' | 'EMAIL_REQUIRED' | 'SERVER_ERROR'
  success?: boolean
}

export async function postNewsletterFormAction(
  _: NewsletterFormState,
  formData: FormData
): Promise<NewsletterFormState> {
  const listIds = Object.values(NEWSLETTER_IDS).filter(
    (id) => !!formData.get(id.toString())
  ) as ListIds

  let email = formData.get('email')?.toString()
  if (!email) {
    const session = await getUserSession()
    if (session?.isAuth) {
      email = session.email
    }
  }

  if (!email) {
    return {
      email: '',
      listIds,
      error: 'EMAIL_REQUIRED',
    }
  }
  if (!isEmailValid(email)) {
    return {
      email,
      listIds,
      error: 'EMAIL_INVALID',
    }
  }

  try {
    await updateNewsletterSubscription({ email, listIds })
    return {
      email,
      listIds,
      success: true,
    }
  } catch (e) {
    captureException(e)
    return {
      email,
      listIds,
      error: 'SERVER_ERROR',
    }
  }
}
