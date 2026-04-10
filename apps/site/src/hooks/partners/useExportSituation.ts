import type { Situation } from '@/publicodes-state/types'
import { exportSituation } from '@/services/partners/exportSituation'
import { useMutation } from '@tanstack/react-query'

export function useExportSituation() {
  const { mutate, mutateAsync, isPending, isSuccess, isError, error, data } =
    useMutation({
      mutationFn: ({
        partner,
        situation,
        partnerParams,
      }: {
        partner: string
        situation: Situation
        partnerParams?: Record<string, string>
      }) => {
        return exportSituation({
          situation,
          partner,
          partnerParams,
        })
      },
    })
  return {
    exportSituation: mutate,
    exportSituationAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    data,
  }
}
