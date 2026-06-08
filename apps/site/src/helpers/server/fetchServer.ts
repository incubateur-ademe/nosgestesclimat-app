'use server'

import { SERVER_URL } from '@/constants/urls/main'
import { handleApiResponse } from '@/helpers/shared/handleApiResponse'
import { cookies, headers as getHeaders } from 'next/headers'
import { SERVER_AUTH_COOKIE_NAME } from './dal/authCookie'
import { InternalServerError } from './error'

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
  const [nextHeaders, cookieStore] = await Promise.all([
    getHeaders(),
    cookies(),
  ])
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    // Some server route need IP of the client (for instance geolocation)
    'x-forwarded-for': nextHeaders.get('x-forwarded-for') ?? '',
  }

  const ngcCookie = cookieStore.get(SERVER_AUTH_COOKIE_NAME)
  if (ngcCookie) {
    headers.cookie = `${ngcCookie.name}=${ngcCookie.value}`
  }
  const response = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers,
    credentials: 'include',
    next,
  })

  return handleApiResponse<T>(response)
}
