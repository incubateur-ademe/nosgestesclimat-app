import { useSearchParams } from 'next/navigation'

export function useGroupIdInQueryParams(): {
  groupIdInQueryParams: string | null
} {
  const searchParams = useSearchParams()

  const groupIdInQueryParams = searchParams.get('groupId')

  return { groupIdInQueryParams }
}
