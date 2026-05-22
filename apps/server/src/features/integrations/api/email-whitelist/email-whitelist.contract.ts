import { initContract } from '@ts-rest/core'
import { StatusCodes } from 'http-status-codes'
import * as v from 'valibot'
import { ApiScopeName } from '../../../../adapters/prisma/generated.ts'
import { ValidationErrorSchema } from '../../../../core/middlewares/validation-error.schema.ts'

const EmailPatternSchema = v.pipe(
  v.union([
    v.pipe(v.string(), v.email()),
    v.pipe(v.string(), v.regex(/^\*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)),
  ]),
  v.transform((emailPattern) => emailPattern.toLocaleLowerCase())
)

const EmailWhitelistCreateDto = v.strictObject({
  scope: v.enum(ApiScopeName),
  emailPattern: EmailPatternSchema,
  description: v.pipe(v.string(), v.minLength(10)),
})

export type EmailWhitelistCreateDto = v.InferOutput<
  typeof EmailWhitelistCreateDto
>

const EmailWhitelistDto = v.strictObject({
  scope: v.enum(ApiScopeName),
  emailPattern: v.string(),
  description: v.string(),
})

const EmailWhitelistParams = v.strictObject({
  whitelistId: v.pipe(v.string(), v.uuid()),
})

export type EmailWhitelistParams = v.InferOutput<typeof EmailWhitelistParams>

const EmailWhitelistsFetchQuery = v.strictObject({
  emailPattern: v.optional(EmailPatternSchema),
})

export type EmailWhitelistsFetchQuery = v.InferOutput<
  typeof EmailWhitelistsFetchQuery
>

const EmailWhitelistUpdateDto = v.partial(
  v.strictObject({
    scope: v.enum(ApiScopeName),
    emailPattern: EmailPatternSchema,
    description: v.pipe(v.string(), v.minLength(10)),
  })
)

export type EmailWhitelistUpdateDto = v.InferOutput<
  typeof EmailWhitelistUpdateDto
>

const c = initContract()

const contract = c.router({
  createEmailWhitelist: {
    method: 'POST',
    path: '/integrations-api/v1/email-whitelists',
    query: v.strictObject({}),
    pathParams: v.strictObject({}),
    body: EmailWhitelistCreateDto,
    responses: {
      [StatusCodes.CREATED as number]: EmailWhitelistDto,
      [StatusCodes.BAD_REQUEST as number]: ValidationErrorSchema,
      [StatusCodes.UNAUTHORIZED as number]: v.string(),
      [StatusCodes.FORBIDDEN as number]: v.string(),
      [StatusCodes.NOT_FOUND as number]: v.string(),
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: v.strictObject({}),
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
    query: v.strictObject({}),
    pathParams: EmailWhitelistParams,
    body: EmailWhitelistUpdateDto,
    responses: {
      [StatusCodes.OK as number]: EmailWhitelistDto,
      [StatusCodes.BAD_REQUEST as number]: ValidationErrorSchema,
      [StatusCodes.UNAUTHORIZED as number]: v.string(),
      [StatusCodes.NOT_FOUND as number]: v.string(),
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: v.strictObject({}),
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
    query: v.strictObject({}),
    pathParams: EmailWhitelistParams,
    body: v.optional(v.strictObject({})),
    responses: {
      [StatusCodes.NO_CONTENT as number]: v.strictObject({}),
      [StatusCodes.BAD_REQUEST as number]: ValidationErrorSchema,
      [StatusCodes.UNAUTHORIZED as number]: v.string(),
      [StatusCodes.NOT_FOUND as number]: v.string(),
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: v.strictObject({}),
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
    pathParams: v.strictObject({}),
    responses: {
      [StatusCodes.OK as number]: v.array(EmailWhitelistDto),
      [StatusCodes.UNAUTHORIZED as number]: v.string(),
      [StatusCodes.INTERNAL_SERVER_ERROR as number]: v.strictObject({}),
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
