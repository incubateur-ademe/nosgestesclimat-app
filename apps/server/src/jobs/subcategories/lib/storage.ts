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
 * Clé S3 d'un fichier d'export.
 *
 * Le préfixe `ngc/` reprend `SCALEWAY_ROOT_PATH` (racine commune aux autres
 * objets du bucket), suivi de `export-subcategories/<période>/`.
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
    if (isNotFound(error)) return null
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
