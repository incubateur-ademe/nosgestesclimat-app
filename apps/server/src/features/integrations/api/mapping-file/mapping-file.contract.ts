import { initContract } from '@ts-rest/core'
import { StatusCodes } from 'http-status-codes'
import { Stream } from 'stream'
import * as v from 'valibot'
import { ValidationErrorSchema } from '../../../../core/middlewares/validation-error.schema.ts'
import { ExternalServiceTypeEnum } from '../../integrations.validator.ts'

export const MappingFileKind = {
  conversion: 'conversion',
  default: 'default',
  absent: 'absent',
  values: 'values',
} as const

export type MappingFileKind =
  (typeof MappingFileKind)[keyof typeof MappingFileKind]

const MappingFileParams = v.strictObject({
  kind: v.enum(MappingFileKind),
  partner: v.enum(ExternalServiceTypeEnum),
})

export type MappingFileParams = v.InferOutput<typeof MappingFileParams>

export const MappingFile = v.strictObject({
  buffer: v.instance(Buffer),
  encoding: v.string(),
  fieldname: v.string(),
  mimetype: v.pipe(v.string(), v.regex(/ya?ml/)),
  originalname: v.pipe(v.string(), v.regex(/\.ya?ml$/)),
  size: v.number(),
  path: v.optional(v.string()),
  filename: v.optional(v.string()),
  destination: v.optional(v.string()),
  stream: v.optional(v.instance(Stream)),
})

export type MappingFile = v.InferOutput<typeof MappingFile>

const c = initContract()

const contract = c.router({
  uploadMappingFile: {
    method: 'PUT',
    path: '/integrations-api/v1/mapping-files',
    contentType: 'multipart/form-data',
    query: v.strictObject({}),
    pathParams: v.strictObject({}),
    body: MappingFileParams,
    responses: {
      [StatusCodes.CREATED as number]: v.string(),
      [StatusCodes.BAD_REQUEST as number]: ValidationErrorSchema,
      [StatusCodes.UNAUTHORIZED as number]: v.string(),
      [StatusCodes.FORBIDDEN as number]: v.string(),
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: v.strictObject({}),
    },
    summary: 'Uploads a configuration file for the situation mapping',
    metadata: {
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['kind', 'partner', 'file'],
              properties: {
                kind: {
                  type: 'string',
                  enum: Object.values(MappingFileKind),
                },
                partner: {
                  type: 'string',
                  enum: Object.values(ExternalServiceTypeEnum),
                },
                file: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          },
        },
      },
    },
  },
  deleteMappingFile: {
    method: 'DELETE',
    path: '/integrations-api/v1/mapping-files/:partner/:kind',
    query: v.strictObject({}),
    pathParams: MappingFileParams,
    body: v.optional(v.strictObject({})),
    responses: {
      [StatusCodes.NO_CONTENT as number]: v.string(),
      [StatusCodes.BAD_REQUEST as number]: ValidationErrorSchema,
      [StatusCodes.UNAUTHORIZED as number]: v.string(),
      [StatusCodes.FORBIDDEN as number]: v.string(),
      [StatusCodes.NOT_FOUND as number]: v.string(),
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: v.strictObject({}),
    },
    summary: 'Deletes a configuration file',
    metadata: {
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  },
  fetchMappingFile: {
    method: 'GET',
    path: '/integrations-api/v1/mapping-files/:partner/:kind',
    query: v.strictObject({}),
    pathParams: MappingFileParams,
    responses: {
      [StatusCodes.MOVED_TEMPORARILY as number]: v.void_(),
      [StatusCodes.BAD_REQUEST as number]: ValidationErrorSchema,
      [StatusCodes.UNAUTHORIZED as number]: v.string(),
      [StatusCodes.FORBIDDEN as number]: v.string(),
      [StatusCodes.NOT_FOUND as number]: v.string(),
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: v.strictObject({}),
    },
    summary: 'Fetches a configuration file',
    metadata: {
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  },
})

export default contract
