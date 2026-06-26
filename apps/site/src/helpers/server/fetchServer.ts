'use server'

import { SERVER_URL } from '@/constants/urls/main'
import { handleApiResponse } from '@/helpers/shared/handleApiResponse'
import type { AppUser } from '@/services/auth/get-user-session'
import { getUserSession } from '@/services/auth/get-user-session'
import { headers } from 'next/headers'
import { InternalServerError } from './error'

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? ''

export async function fetchServer<T = unknown>(
  url: string,
  {
    method = 'GET',
    body,
    next,
    session,
  }: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
    next?: NextFetchRequestConfig
    /**
     * Optional session override. When a service creates a new session
     * within the same request (e.g. via {@link withUserId}), the
     * `x-session` request header is not yet populated — it is only set
     * by the proxy on the next request cycle. Pass the session here so
     * `fetchServer` can forward it to Express immediately.
     */
    session?: AppUser
  } = {}
): Promise<T> {
  if (!url.startsWith(SERVER_URL)) {
    throw new InternalServerError()
  }

  const nextHeaders = await headers()

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-forwarded-for': nextHeaders.get('x-forwarded-for') ?? '',
    'x-internal-key': INTERNAL_API_KEY,
  }

  const effectiveSession = session ?? (await getUserSession())
  if (effectiveSession) {
    reqHeaders['x-session'] = JSON.stringify(effectiveSession)
  }

  const response = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: reqHeaders,
    credentials: 'include',
    next,
  })

  return handleApiResponse<T>(response)
}
