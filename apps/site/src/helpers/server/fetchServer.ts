'use server'

import { SERVER_URL } from '@/constants/urls/main'
import { handleApiResponse } from '@/helpers/shared/handleApiResponse'
import { headers as getHeaders } from 'next/headers'
import { InternalServerError } from './error'

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? ''

export async function fetchServer<T = unknown>(
  url: string,
  {
    method = 'GET',
    body,
    next,
  }: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
    next?: NextFetchRequestConfig
  } = {}
): Promise<T> {
  if (!url.startsWith(SERVER_URL)) {
    throw new InternalServerError()
  }

  const nextHeaders = await getHeaders()

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-forwarded-for': nextHeaders.get('x-forwarded-for') ?? '',
    'x-internal-key': INTERNAL_API_KEY,
  }

  const sessionHeader = nextHeaders.get('x-session')
  if (sessionHeader) {
    const { userId, email } = JSON.parse(sessionHeader)
    reqHeaders['x-user-id'] = userId
    if (email) {
      reqHeaders['x-user-email'] = email
    }
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
