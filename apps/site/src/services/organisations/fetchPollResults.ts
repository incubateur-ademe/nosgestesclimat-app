import { ORGANISATION_URL } from '@/constants/urls/main'
import type {
  AcceptedExcelExportType,
  ExcelExportType,
  PublicOrganisationPoll,
} from '@/types/organisations'
import axios from 'axios'

const isExcelExport = (
  data: AcceptedExcelExportType | ExcelExportType,
  status: number
): data is ExcelExportType => status === 200

const FETCH_POLL_RESULTS_DELAY_MS = 500

export const fetchPollResults = ({
  poll: {
    slug: pollIdOrSlug,
    organisation: { slug: orgaIdOrSlug },
  },
}: {
  poll: PublicOrganisationPoll
}) =>
  new Promise<ExcelExportType>((resolve, reject) => {
    const performRequest = async (jobId?: string) => {
      try {
        const url = new URL(
          `${ORGANISATION_URL}/${orgaIdOrSlug}/polls/${pollIdOrSlug}/simulations/download`
        )

        if (jobId) {
          url.searchParams.set('jobId', jobId)
        }

        const { data, status } = await axios.get(url.toString(), {
          withCredentials: true,
        })

        if (isExcelExport(data, status)) {
          return resolve(data)
        }

        return setTimeout(
          () => performRequest(data.id),
          FETCH_POLL_RESULTS_DELAY_MS
        )
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        return reject(e)
      }
    }

    return performRequest()
  })
