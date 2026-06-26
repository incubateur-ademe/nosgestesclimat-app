'use server'

import { INTEGRATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type { Situation } from '@/publicodes-state/types'

export async function exportSituation({
  situation,
  partner,
  partnerParams,
}: {
  situation: Situation
  partner: string
  partnerParams?: Record<string, string>
}): Promise<{ redirectUrl: string } | null> {
  const partnerParamsToSend = { ...partnerParams }
  delete partnerParamsToSend?.partner

  return fetchServer<{ redirectUrl: string }>(
    `${INTEGRATION_URL}/${partner}/export-situation?${new URLSearchParams(partnerParamsToSend).toString()}`,
    {
      method: 'POST',
      body: situation,
    }
  ).catch(() => null)
}
