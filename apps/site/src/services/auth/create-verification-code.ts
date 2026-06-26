'use server'

import { VERIFICATION_CODE_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { AuthenticationMode } from '@/types/authentication'

export const createVerificationCode = async ({
  email,
  mode,
  locale,
}: {
  email: string
  mode?: AuthenticationMode
  locale?: string
}) => {
  const params = new URLSearchParams()
  if (mode) params.set('mode', mode)
  if (locale) params.set('locale', locale)
  const qs = params.toString()

  return fetchServer<{ expirationDate: string }>(
    `${VERIFICATION_CODE_URL}${qs ? `?${qs}` : ''}`,
    { method: 'POST', body: { email } }
  )
}
