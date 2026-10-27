/**
 * Stockage des exports de sous catégories dans le bucket Scaleway.
 *
 * Préfixe : `ngc/export-subcategories/<période>/` (`rootPath` = `ngc`).
 *
 * Le conteneur one-off Scalingo est éphémère : le CSV et le checkpoint sont
 * écrits en local pendant le run, puis envoyés au bucket régulièrement. C'est
 * ce qui permet de reprendre un run interrompu.
 *
 * Le client S3 est chargé **paresseusement** : `config.ts` valide tout
 * l'environnement du serveur à l'import, ce qui empêcherait de lancer le job en
 * local avec `--no-upload` et un environnement partiel.
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
 * Clé S3 d'un fichier du job : `ngc/export-subcategories/<période>/<fichier>`.
 *
 * Toute clé du job doit passer par ici : la politique du bucket restreint les
 * accès à `ngc/*`, une clé hors de ce préfixe est refusée.
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
 * Sans la permission `s3:ListBucket`, S3 répond **403 Access Denied** (et non
 * 404) à la lecture d'un objet absent : impossible de distinguer « absent » de
 * « interdit ». Pour le cache des règles — dont l'absence est le cas normal au
 * premier run — on traite donc 403 comme une absence.
 */
const isAbsent = (error: unknown): boolean => {
  const name = (error as { name?: string } | null)?.name
  const status = (error as { $metadata?: { httpStatusCode?: number } } | null)
    ?.$metadata?.httpStatusCode
  return isNotFound(error) || name === 'AccessDenied' || status === 403
}

/** Message d'erreur lisible, avec l'opération et la clé concernées. */
export const describeStorageError = (
  operation: 'lecture' | 'écriture',
  key: string,
  error: unknown
): string => {
  const message = error instanceof Error ? error.message : String(error)
  const status = (error as { $metadata?: { httpStatusCode?: number } } | null)
    ?.$metadata?.httpStatusCode
  return `${operation} S3 impossible (${key}${status ? `, HTTP ${status}` : ''}) : ${message}`
}

/** Télécharge un fichier du bucket, ou `null` s'il n'existe pas. */
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

/** Envoie un contenu texte dans le bucket. */
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
