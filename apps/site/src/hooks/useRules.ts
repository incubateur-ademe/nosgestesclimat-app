import { getRules } from '@/helpers/modelFetching/getRules'
import { useUser } from '@/publicodes-state'
import type { NGCRules } from '@incubateur-ademe/nosgestesclimat'
import type { UseQueryResult } from '@tanstack/react-query'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useLocale } from './useLocale'

interface Props {
  isOptim?: boolean
  region?: string
  PRNumber?: string
}

export function useRules(
  { isOptim = true, region = 'FR', PRNumber }: Props = {
    isOptim: true,
    region: 'FR',
  }
): UseQueryResult<Partial<NGCRules>, Error> {
  const locale = useLocale()
  const { user } = useUser()

  const regionCode =
    user?.region?.code != undefined && user?.region?.code !== ''
      ? user?.region?.code
      : region

  return useQuery({
    queryKey: ['rules', locale, regionCode, isOptim, PRNumber],
    queryFn: () =>
      getRules({
        locale,
        regionCode,
        isOptim,
        PRNumber,
      }),
    placeholderData: keepPreviousData,
    staleTime: Infinity, // We don't want to import the rule multiple times
    gcTime: 1000 * 60 * 60 * 24, // 24h
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
