import { handleApiResponse } from '@/helpers/shared/handleApiResponse'

export async function fetchClient<T = unknown>(
  url: string,
  {
    method = 'GET',
    body,
  }: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
  } = {}
): Promise<T> {
  const response = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  return handleApiResponse<T>(response)
}
