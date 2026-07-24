'use server'

import {
  RateLimitedError,
  UnknownCodeError,
  type EmailError,
} from '@/components/authentication/errors'
import { VERIFICATION_CODE_URL } from '@/constants/urls/main'
import { TooManyRequestsError } from '@/helpers/server/error'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { AuthenticationMode } from '@/types/authentication'
import { err, ok, type Result } from '@nosgestesclimat/core/lib/result'

export const createVerificationCode = async ({
  email,
  mode,
  locale,
}: {
  email: string
  mode?: AuthenticationMode
  locale?: string
}): Promise<Result<{ expirationDate: string }, EmailError>> => {
  const params = new URLSearchParams()
  if (mode) params.set('mode', mode)
  if (locale) params.set('locale', locale)
  const qs = params.toString()

  try {
    const data = await fetchServer<{ expirationDate: string }>(
      `${VERIFICATION_CODE_URL}${qs ? `?${qs}` : ''}`,
      { method: 'POST', body: { email } }
    )
    return ok(data)
  } catch (error) {
    if (error instanceof TooManyRequestsError)
      return err(new RateLimitedError())
    return err(new UnknownCodeError())
  }
}
