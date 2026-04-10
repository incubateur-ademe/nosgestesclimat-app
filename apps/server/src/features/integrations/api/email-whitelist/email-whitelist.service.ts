import { prisma } from '../../../../adapters/prisma/client.js'
import { transaction } from '../../../../adapters/prisma/transaction.js'
import { EntityNotFoundException } from '../../../../core/errors/EntityNotFoundException.js'
import { ForbiddenException } from '../../../../core/errors/ForbiddenException.js'
import { isPrismaErrorNotFound } from '../../../../core/typeguards/isPrismaError.js'
import type {
  EmailWhitelistCreateDto,
  EmailWhitelistParams,
  EmailWhitelistsFetchQuery,
  EmailWhitelistUpdateDto,
} from './email-whitelist.contract.js'
import {
  createWhitelist,
  deleteWhitelist,
  fetchWhitelists,
  updateWhitelist,
} from './email-whitelist.repository.js'

const whitelistToDto = ({
  apiScopeName,
  ...whitelist
}: Awaited<ReturnType<typeof createWhitelist>>) => ({
  ...whitelist,
  scope: apiScopeName,
})

export const createEmailWhitelist = async ({
  emailWhitelistDto,
  userScopes,
}: {
  emailWhitelistDto: EmailWhitelistCreateDto
  userScopes: Set<string>
}) => {
  try {
    if (!userScopes.has(emailWhitelistDto.scope)) {
      throw new ForbiddenException(
        `Unauthorized to create whitelist for ${emailWhitelistDto.scope}`
      )
    }

    const whitelist = await transaction((session) =>
      createWhitelist(emailWhitelistDto, { session })
    )

    return whitelistToDto(whitelist)
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('ApiScope not found')
    }
    throw e
  }
}

export const updateEmailWhitelist = async ({
  params,
  userScopes,
  emailWhitelistDto,
}: {
  params: EmailWhitelistParams
  userScopes: Set<string>
  emailWhitelistDto: EmailWhitelistUpdateDto
}) => {
  try {
    const whitelist = await transaction((session) =>
      updateWhitelist(params, emailWhitelistDto, userScopes, { session })
    )

    return whitelistToDto(whitelist)
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Email Whitelist not found')
    }
    throw e
  }
}

export const deleteEmailWhitelist = async ({
  params,
  userScopes,
}: {
  params: EmailWhitelistParams
  userScopes: Set<string>
}) => {
  try {
    await transaction((session) =>
      deleteWhitelist(params, userScopes, { session })
    )
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Email Whitelist not found')
    }
    throw e
  }
}

export const fetchEmailWhitelists = async ({
  query,
  userScopes,
}: {
  query: EmailWhitelistsFetchQuery
  userScopes: Set<string>
}) => {
  const whitelists = await transaction(
    (session) =>
      fetchWhitelists(
        {
          ...query,
          scopes: userScopes,
        },
        { session }
      ),
    prisma
  )

  return whitelists.map(whitelistToDto)
}
