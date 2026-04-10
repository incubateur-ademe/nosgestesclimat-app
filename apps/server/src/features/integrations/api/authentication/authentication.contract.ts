import { initContract, ZodErrorSchema } from '@ts-rest/core'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'
import {
  isValidRefreshToken,
  REFRESH_TOKEN_SCOPE,
} from './authentication.service.js'

const GenerateAPITokenRequestDto = z
  .object({
    email: z.email().transform((email) => email.toLocaleLowerCase()),
  })
  .strict()

export type GenerateAPITokenRequestDto = z.infer<
  typeof GenerateAPITokenRequestDto
>

const GenerateAPITokenResponseDto = z.object({
  message: z.string(),
})

const RecoverApiTokenQuery = z
  .object({
    code: z.string().regex(/^\d{6}$/),
    email: z.email().transform((email) => email.toLocaleLowerCase()),
  })
  .strict()

export type RecoverApiTokenQuery = z.infer<typeof RecoverApiTokenQuery>

const RecoverApiTokenResponseDto = z.object({
  token: z.string(),
  refreshToken: z.string(),
})

const RefreshApiTokenRequestDto = z
  .object({
    refreshToken: z.string(),
  })
  .strict()

export const AsyncRefreshApiTokenRequestDto = RefreshApiTokenRequestDto.refine(
  ({ refreshToken }) => isValidRefreshToken(refreshToken),
  `Refresh token must be a valid, non expired JWT with a ${REFRESH_TOKEN_SCOPE} scope`
)

const c = initContract()

const contract = c.router({
  generateApiToken: {
    method: 'POST',
    path: '/integrations-api/v1/tokens',
    query: z.object({}).strict(),
    pathParams: z.object({}).strict(),
    body: GenerateAPITokenRequestDto,
    responses: {
      [StatusCodes.CREATED as number]: GenerateAPITokenResponseDto,
      [StatusCodes.BAD_REQUEST as number]: ZodErrorSchema,
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: z.object({}).strict(),
    },
    summary: 'Ask for an API token for the given email',
  },
  recoverApiToken: {
    method: 'GET',
    path: '/integrations-api/v1/tokens',
    query: RecoverApiTokenQuery,
    pathParams: z.object({}).strict(),
    responses: {
      [StatusCodes.OK as number]: RecoverApiTokenResponseDto,
      [StatusCodes.BAD_REQUEST as number]: ZodErrorSchema,
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: z.object({}).strict(),
    },
    summary: 'Recover an API token from the given email',
  },
  refreshApiToken: {
    method: 'POST',
    path: '/integrations-api/v1/tokens/refresh',
    query: z.object({}).strict(),
    pathParams: z.object({}).strict(),
    body: RefreshApiTokenRequestDto,
    responses: {
      [StatusCodes.OK as number]: RecoverApiTokenResponseDto,
      [StatusCodes.BAD_REQUEST as number]: ZodErrorSchema,
      [StatusCodes.UNAUTHORIZED as number]: z.string(),
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: z.object({}).strict(),
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
