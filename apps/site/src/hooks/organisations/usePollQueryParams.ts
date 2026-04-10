import { useSearchParams } from 'next/navigation'

export function usePollQueryParams() {
  const searchParams = useSearchParams()

  return { pollSlug: searchParams.get('poll') }
}
