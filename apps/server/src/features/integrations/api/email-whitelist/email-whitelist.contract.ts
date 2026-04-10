import { initContract, ZodErrorSchema } from '@ts-rest/core'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'
import { ApiScopeName } from '../../../../adapters/prisma/generated.js'

const EmailPatternSchema = z
  .union([z.email(), z.string().regex(/^\*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)])
  .transform((emailPattern) => emailPattern.toLocaleLowerCase())

const EmailWhitelistCreateDto = z
  .object({
    scope: z.enum(ApiScopeName),
    emailPattern: EmailPatternSchema,
    description: z.string().min(10),
  })
  .strict()

export type EmailWhitelistCreateDto = z.infer<typeof EmailWhitelistCreateDto>

const EmailWhitelistDto = z
  .object({
    scope: z.enum(ApiScopeName),
    emailPattern: z.string(),
    description: z.string(),
  })
  .strict()

const EmailWhitelistParams = z
  .object({
    whitelistId: z.uuid(),
  })
  .strict()

export type EmailWhitelistParams = z.infer<typeof EmailWhitelistParams>

const EmailWhitelistsFetchQuery = z
  .object({
    emailPattern: EmailPatternSchema.optional(),
  })
  .strict()

export type EmailWhitelistsFetchQuery = z.infer<
  typeof EmailWhitelistsFetchQuery
>

const EmailWhitelistUpdateDto = z
  .object({
    scope: z.enum(ApiScopeName),
    emailPattern: EmailPatternSchema,
    description: z.string().min(10),
  })
  .strict()
  .partial()

export type EmailWhitelistUpdateDto = z.infer<typeof EmailWhitelistUpdateDto>

const c = initContract()

const contract = c.router({
  createEmailWhitelist: {
    method: 'POST',
    path: '/integrations-api/v1/email-whitelists',
    query: z.object({}).strict(),
    pathParams: z.object({}).strict(),
    body: EmailWhitelistCreateDto,
    responses: {
      [StatusCodes.CREATED as number]: EmailWhitelistDto,
      [StatusCodes.BAD_REQUEST as number]: ZodErrorSchema,
      [StatusCodes.UNAUTHORIZED as number]: z.string(),
      [StatusCodes.FORBIDDEN as number]: z.string(),
      [StatusCodes.NOT_FOUND as number]: z.string(),
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: z.object({}).strict(),
    },
    summary: 'Creates an email whitelist for the given API scope',
    metadata: {
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  },
  updateEmailWhitelist: {
    method: 'PUT',
    path: '/integrations-api/v1/email-whitelists/:whitelistId',
    query: z.object({}).strict(),
    pathParams: EmailWhitelistParams,
    body: EmailWhitelistUpdateDto,
    responses: {
      [StatusCodes.OK as number]: EmailWhitelistDto,
      [StatusCodes.BAD_REQUEST as number]: ZodErrorSchema,
      [StatusCodes.UNAUTHORIZED as number]: z.string(),
      [StatusCodes.NOT_FOUND as number]: z.string(),
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: z.object({}).strict(),
    },
    summary: 'Updates an email whitelist for the given id',
    metadata: {
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  },
  deleteEmailWhitelist: {
    method: 'DELETE',
    path: '/integrations-api/v1/email-whitelists/:whitelistId',
    query: z.object({}).strict(),
    pathParams: EmailWhitelistParams,
    body: z.object({}).strict().optional(),
    responses: {
      [StatusCodes.NO_CONTENT as number]: z.object({}).strict(),
      [StatusCodes.BAD_REQUEST as number]: ZodErrorSchema,
      [StatusCodes.UNAUTHORIZED as number]: z.string(),
      [StatusCodes.NOT_FOUND as number]: z.string(),
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: z.object({}).strict(),
    },
    summary: 'Deletes an email whitelist for the given id',
    metadata: {
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  },
  fetchEmailWhitelists: {
    method: 'GET',
    path: '/integrations-api/v1/email-whitelists',
    query: EmailWhitelistsFetchQuery,
    pathParams: z.object({}).strict(),
    responses: {
      [StatusCodes.OK as number]: z.array(EmailWhitelistDto),
      [StatusCodes.UNAUTHORIZED as number]: z.string(),
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: z.object({}).strict(),
    },
    summary: 'Fetch email whitelists for the token scope and filters',
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
