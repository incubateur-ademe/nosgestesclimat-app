import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { ApiScopeName } from '../../../../adapters/prisma/generated.js'
import { client } from '../../../../adapters/scaleway/client.js'
import { config } from '../../../../config.js'
import { EntityNotFoundException } from '../../../../core/errors/EntityNotFoundException.js'
import { ForbiddenException } from '../../../../core/errors/ForbiddenException.js'
import { isScalewayErrorNotFound } from '../../../../core/typeguards/isScalewayError.js'
import { ExternalServiceTypeEnum } from '../../integrations.validator.js'
import type { MappingFile, MappingFileParams } from './mapping-file.contract.js'

const MAPPING_FILES_ROOT_PATH = 'mapping-files'

const MAPPING_FILES_EXTENSION = 'yml'

const { bucket, rootPath } = config.thirdParty.scaleway

const getFilePath = ({ partner, kind }: MappingFileParams) =>
  `${partner}/${kind}.${MAPPING_FILES_EXTENSION}`

const getKey = (filePath: string) =>
  `${rootPath}/${MAPPING_FILES_ROOT_PATH}/${filePath}`

export const SCOPES_FOR_PARTNERS: Record<
  ExternalServiceTypeEnum,
  ApiScopeName[]
> = {
  [ExternalServiceTypeEnum.agir]: [ApiScopeName.agir, ApiScopeName.ngc],
  [ExternalServiceTypeEnum['2-tonnes']]: [
    ApiScopeName.two_tons,
    ApiScopeName.ngc,
  ],
}

export const uploadMappingFile = async ({
  file: { buffer },
  fileCreateDto,
  fileCreateDto: { partner },
  userScopes,
}: {
  file: MappingFile
  fileCreateDto: MappingFileParams
  userScopes: Set<string>
}) => {
  if (!SCOPES_FOR_PARTNERS[partner].some((scope) => userScopes.has(scope))) {
    throw new ForbiddenException(`Forbidden ! Upload file for ${partner}`)
  }

  const filePath = getFilePath(fileCreateDto)
  const key = getKey(filePath)

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ACL: ObjectCannedACL.private,
    })
  )

  return `File ${filePath} uploaded successfully`
}

export const deleteMappingFile = async ({
  params,
  params: { partner },
  userScopes,
}: {
  params: MappingFileParams
  userScopes: Set<string>
}) => {
  try {
    if (!SCOPES_FOR_PARTNERS[partner].some((scope) => userScopes.has(scope))) {
      throw new ForbiddenException(`Forbidden ! Delete file for ${partner}`)
    }

    const filePath = getFilePath(params)
    const key = getKey(filePath)

    await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    )

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    )

    return `File ${filePath} deleted successfully`
  } catch (err) {
    if (isScalewayErrorNotFound(err)) {
      throw new EntityNotFoundException('Mapping File not found')
    }
    throw err
  }
}

export const fetchMappingFile = async ({
  params,
  params: { partner },
  userScopes,
}: {
  params: MappingFileParams
  userScopes: Set<string>
}) => {
  try {
    if (!SCOPES_FOR_PARTNERS[partner].some((scope) => userScopes.has(scope))) {
      throw new ForbiddenException(`Forbidden ! Delete file for ${partner}`)
    }

    const filePath = getFilePath(params)
    const key = getKey(filePath)

    await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    )

    return await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
      { expiresIn: 60 }
    )
  } catch (err) {
    if (isScalewayErrorNotFound(err)) {
      throw new EntityNotFoundException('Mapping File not found')
    }
    throw err
  }
}

export const getMappingFile = async (params: MappingFileParams) => {
  try {
    const filePath = getFilePath(params)
    const key = getKey(filePath)

    const { Body } = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    )

    return Body?.transformToString()
  } catch (err) {
    if (isScalewayErrorNotFound(err)) {
      throw new EntityNotFoundException('Mapping File not found')
    }
    throw err
  }
}
