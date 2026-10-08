import { getPreviewUrl } from '@/constants/urls/main'
import _logger from '@/logger/logger.browser'
import { isServerSide } from '@/utils/nextjs/isServerSide'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import axios from 'axios'

interface Props {
  fileName: string
  PRNumber: string
}

// fetch file from PR
export async function importPreviewFile({
  fileName,
  PRNumber,
}: Props): Promise<unknown> {
  const logger = _logger.child({
    scope: 'site.engine.importPreviewFile',
    PRNumber,
    fileName,
  })
  const previewURL = getPreviewUrl(PRNumber)

  if (!isServerSide()) {
    logger.debug('Fetching the model from the preview deployment')
  }

  return await axios
    .get(`${previewURL}/${fileName}`)
    .then((res) => res.data)
    .catch((error) => {
      logger.error(toError(error))
      return null
    })
}
