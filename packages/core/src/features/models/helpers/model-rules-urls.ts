const MODEL_PACKAGE = '@incubateur-ademe/nosgestesclimat'

const DEFAULT_PREVIEW_BASE_URL =
  'https://nosgestesclimat-dev.s3.fr-par.scw.cloud/model'

const DEFAULT_REGISTRY_BASE_URL = 'https://cdn.jsdelivr.net/npm'

/** Where a PR's model build is uploaded by the model repository's CI. */
export const getPreviewModelBaseUrl = (PRNumber: string | number): string =>
  `${DEFAULT_PREVIEW_BASE_URL}/${PRNumber}`

/** Where a PR's model build is uploaded by the model repository's CI. */
export const getPreviewModelUrl = (
  PRNumber: string | number,
  filename: string
): string => `${getPreviewModelBaseUrl(PRNumber)}/${filename}`

/**
 * Any published model version, served straight from the npm registry CDN, so
 * older versions do not have to be installed to be computed.
 */
export const getPublishedModelUrl = (
  publishedTag: string,
  filename: string
): string =>
  `${DEFAULT_REGISTRY_BASE_URL}/${MODEL_PACKAGE}@${publishedTag}/public/${filename}`
