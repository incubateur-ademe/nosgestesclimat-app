'use server'

import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import type {
  AcceptedExcelExportType,
  ExcelExportType,
  PublicOrganisationPoll,
} from '@/types/organisations'

const POLL_DELAY_MS = 500

const isExcelExport = (
  data: AcceptedExcelExportType | ExcelExportType
): data is ExcelExportType => 'url' in data

export const downloadPollResults = ({
  poll: {
    slug: pollIdOrSlug,
    organisation: { slug: orgaIdOrSlug },
  },
}: {
  poll: PublicOrganisationPoll
}): Promise<ExcelExportType> =>
  new Promise<ExcelExportType>((resolve, reject) => {
    const performRequest = async (jobId?: string) => {
      try {
        const path = `${ORGANISATION_URL}/${orgaIdOrSlug}/polls/${pollIdOrSlug}/simulations/download`

        const url = jobId ? `${path}?jobId=${jobId}` : path

        const data = await fetchServer<
          AcceptedExcelExportType | ExcelExportType
        >(url)

        if (isExcelExport(data)) {
          return resolve(data)
        }

        return setTimeout(() => performRequest(data.id), POLL_DELAY_MS)
      } catch (e) {
        return reject(e instanceof Error ? e : new Error(String(e)))
      }
    }

    return performRequest()
  })
