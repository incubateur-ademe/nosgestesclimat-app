/**
 * Storage of the sub-category exports in the Scaleway bucket.
 *
 * The Scalingo one-off container is ephemeral: the CSV and the checkpoint are
 * written locally during the run and uploaded regularly, which is what makes an
 * interrupted run resumable.
 *
 * The S3 client is loaded **lazily**: `config.ts` validates the whole server
 * environment on import, which would prevent running the job locally with
 * `--no-upload` and a partial environment.
 */

import type { S3Client } from '@aws-sdk/client-s3'

export const EXPORT_ROOT_PATH = 'export-subcategories'

type StorageContext = { client: S3Client; bucket: string }

let contextPromise: Promise<StorageContext> | null = null

const getContext = (): Promise<StorageContext> => {
  contextPromise ??= (async () => {
    const [{ client }, { config }] = await Promise.all([
      import('../../../adapters/scaleway/client.ts'),
      import('../../../config.ts'),
    ])
    return { client, bucket: config.thirdParty.scaleway.bucket }
  })()
  return contextPromise
}

/**
 * S3 key of a job file. Every key of the job must go through here: the bucket
 * policy restricts access to `ngc/*`.
 */
export const buildKey = (period: string, filename: string): string =>
  ['ngc', EXPORT_ROOT_PATH, period, filename].filter(Boolean).join('/')

const isNotFound = (error: unknown): boolean => {
  const name = (error as { name?: string } | null)?.name
  const status = (error as { $metadata?: { httpStatusCode?: number } } | null)
    ?.$metadata?.httpStatusCode
  return (
    name === 'NoSuchKey' ||
    name === 'NotFound' ||
    name === '404' ||
    status === 404
  )
}

/**
 * Without the `s3:ListBucket` permission, S3 answers **403 Access Denied** (not
 * 404) when reading a missing object, so "absent" and "forbidden" cannot be
 * told apart. For the rules cache — where absence is the normal case on the
 * first run — 403 is therefore treated as absent.
 */
const isAbsent = (error: unknown): boolean => {
  const name = (error as { name?: string } | null)?.name
  const status = (error as { $metadata?: { httpStatusCode?: number } } | null)
    ?.$metadata?.httpStatusCode
  return isNotFound(error) || name === 'AccessDenied' || status === 403
}

/** Human-readable error message, with the failed operation and key. */
export const describeStorageError = (
  operation: 'read' | 'write',
  key: string,
  error: unknown
): string => {
  const message = error instanceof Error ? error.message : String(error)
  const status = (error as { $metadata?: { httpStatusCode?: number } } | null)
    ?.$metadata?.httpStatusCode
  return `S3 ${operation} failed (${key}${status ? `, HTTP ${status}` : ''}): ${message}`
}

/** Downloads a file from the bucket, or `null` if it does not exist. */
export const downloadText = async (key: string): Promise<string | null> => {
  const { client, bucket } = await getContext()
  const { GetObjectCommand } = await import('@aws-sdk/client-s3')
  try {
    const response = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    )
    return (await response.Body?.transformToString()) ?? null
  } catch (error) {
    if (isAbsent(error)) return null
    throw error
  }
}

/** Uploads a text body to the bucket. */
export const uploadText = async (
  key: string,
  body: string,
  contentType = 'text/csv; charset=utf-8'
): Promise<void> => {
  const { client, bucket } = await getContext()
  const { PutObjectCommand } = await import('@aws-sdk/client-s3')
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
}
