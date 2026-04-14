import { INTEGRATION_URL } from '@/constants/urls/main'
import type { Situation } from '@/publicodes-state/types'
import { captureException } from '@sentry/nextjs'
import axios from 'axios'

export async function exportSituation({
  situation,
  partner,
  partnerParams,
}: {
  situation: Situation
  partner: string
  partnerParams?: Record<string, string>
}): Promise<{ redirectUrl: string } | null> {
  try {
    const partnerParamsToSend = { ...partnerParams }
    delete partnerParamsToSend?.partner

    const { data } = await axios.post(
      `${INTEGRATION_URL}/${partner}/export-situation`,
      situation,
      {
        params: partnerParamsToSend,
      }
    )

    return data
  } catch (err) {
    captureException(err)
    return null
  }
}
