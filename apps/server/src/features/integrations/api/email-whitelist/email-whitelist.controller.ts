import { StatusCodes } from 'http-status-codes'
import { EntityNotFoundException } from '../../../../core/errors/EntityNotFoundException.js'
import { ForbiddenException } from '../../../../core/errors/ForbiddenException.js'
import { tsRestServer } from '../../../../core/ts-rest.js'
import logger from '../../../../logger.js'
import { generateAuthenticationMiddleware } from '../authentication/authentication.service.js'
import emailWhitelistContract from './email-whitelist.contract.js'
import {
  createEmailWhitelist,
  deleteEmailWhitelist,
  fetchEmailWhitelists,
  updateEmailWhitelist,
} from './email-whitelist.service.js'

const router = tsRestServer.router(emailWhitelistContract, {
  createEmailWhitelist: {
    middleware: [generateAuthenticationMiddleware()],
    handler: async ({ body, req }) => {
      try {
        return {
          body: await createEmailWhitelist({
            emailWhitelistDto: body,
            userScopes: req.apiUser!.scopes,
          }),
          status: StatusCodes.CREATED,
        }
      } catch (err) {
        if (err instanceof ForbiddenException) {
          return {
            body: err.message,
            status: StatusCodes.FORBIDDEN,
          }
        }

        if (err instanceof EntityNotFoundException) {
          return {
            body: err.message,
            status: StatusCodes.NOT_FOUND,
          }
        }

        logger.error('Email Whitelist creation failed', err)
        return {
          body: {},
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        }
      }
    },
  },
  updateEmailWhitelist: {
    middleware: [generateAuthenticationMiddleware()],
    handler: async ({ params, req, body }) => {
      try {
        return {
          body: await updateEmailWhitelist({
            params,
            userScopes: req.apiUser!.scopes,
            emailWhitelistDto: body,
          }),
          status: StatusCodes.OK,
        }
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return {
            body: err.message,
            status: StatusCodes.NOT_FOUND,
          }
        }

        logger.error('Email Whitelist update failed', err)
        return {
          body: {},
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        }
      }
    },
  },
  deleteEmailWhitelist: {
    middleware: [generateAuthenticationMiddleware()],
    handler: async ({ params, req }) => {
      try {
        await deleteEmailWhitelist({
          params,
          userScopes: req.apiUser!.scopes,
        })
        return {
          body: {},
          status: StatusCodes.NO_CONTENT,
        }
      } catch (err) {
        if (err instanceof EntityNotFoundException) {
          return {
            body: err.message,
            status: StatusCodes.NOT_FOUND,
          }
        }

        logger.error('Email Whitelist deletion failed', err)
        return {
          body: {},
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        }
      }
    },
  },
  fetchEmailWhitelists: {
    middleware: [generateAuthenticationMiddleware()],
    handler: async ({ query, req }) => {
      try {
        return {
          body: await fetchEmailWhitelists({
            query,
            userScopes: req.apiUser!.scopes,
          }),
          status: StatusCodes.OK,
        }
      } catch (err) {
        logger.error('Email Whitelists fetch failed', err)
        return {
          body: {},
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        }
      }
    },
  },
})

export default router
