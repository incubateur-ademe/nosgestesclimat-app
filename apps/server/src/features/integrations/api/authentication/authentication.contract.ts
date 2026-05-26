import { initContract } from '@ts-rest/core'
import { StatusCodes } from 'http-status-codes'
import * as v from 'valibot'
import { ValidationErrorSchema } from '../../../../core/middlewares/validation-error.schema.ts'
import {
  isValidRefreshToken,
  REFRESH_TOKEN_SCOPE,
} from './authentication.service.ts'

const GenerateAPITokenRequestDto = v.strictObject({
  email: v.pipe(
    v.string(),
    v.email(),
    v.transform((email) => email.toLocaleLowerCase())
  ),
})

export type GenerateAPITokenRequestDto = v.InferOutput<
  typeof GenerateAPITokenRequestDto
>

const GenerateAPITokenResponseDto = v.strictObject({
  message: v.string(),
})

const RecoverApiTokenQuery = v.strictObject({
  code: v.pipe(v.string(), v.regex(/^\d{6}$/)),
  email: v.pipe(
    v.string(),
    v.email(),
    v.transform((email) => email.toLocaleLowerCase())
  ),
})

export type RecoverApiTokenQuery = v.InferOutput<typeof RecoverApiTokenQuery>

const RecoverApiTokenResponseDto = v.strictObject({
  token: v.string(),
  refreshToken: v.string(),
})

const RefreshApiTokenRequestDto = v.strictObject({
  refreshToken: v.string(),
})

export const AsyncRefreshApiTokenRequestDto = v.pipeAsync(
  RefreshApiTokenRequestDto,
  v.checkAsync(
    async ({ refreshToken }) => !!(await isValidRefreshToken(refreshToken)),
    `Refresh token must be a valid, non expired JWT with a ${REFRESH_TOKEN_SCOPE} scope`
  )
)

const c = initContract()

const contract = c.router({
  generateApiToken: {
    method: 'POST',
    path: '/integrations-api/v1/tokens',
    query: v.strictObject({}),
    pathParams: v.strictObject({}),
    body: GenerateAPITokenRequestDto,
    responses: {
      [StatusCodes.CREATED as number]: GenerateAPITokenResponseDto,
      [StatusCodes.BAD_REQUEST as number]: ValidationErrorSchema,
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: v.strictObject({}),
    },
    summary: 'Ask for an API token for the given email',
  },
  recoverApiToken: {
    method: 'GET',
    path: '/integrations-api/v1/tokens',
    query: RecoverApiTokenQuery,
    pathParams: v.strictObject({}),
    responses: {
      [StatusCodes.OK as number]: RecoverApiTokenResponseDto,
      [StatusCodes.BAD_REQUEST as number]: ValidationErrorSchema,
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: v.strictObject({}),
    },
    summary: 'Recover an API token from the given email',
  },
  refreshApiToken: {
    method: 'POST',
    path: '/integrations-api/v1/tokens/refresh',
    query: v.strictObject({}),
    pathParams: v.strictObject({}),
    body: RefreshApiTokenRequestDto,
    responses: {
      [StatusCodes.OK as number]: RecoverApiTokenResponseDto,
      [StatusCodes.BAD_REQUEST as number]: ValidationErrorSchema,
      [StatusCodes.UNAUTHORIZED as number]: v.string(),
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: v.strictObject({}),
    },
    summary: 'Refresh an API token with the given refreshToken',
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
