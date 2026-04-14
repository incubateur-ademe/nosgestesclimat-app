import type { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import yaml from 'yaml'
import { EntityNotFoundException } from '../../../../core/errors/EntityNotFoundException.js'
import { ForbiddenException } from '../../../../core/errors/ForbiddenException.js'
import { tsRestServer } from '../../../../core/ts-rest.js'
import logger from '../../../../logger.js'
import { generateAuthenticationMiddleware } from '../authentication/authentication.service.js'
import mappingFileContract, { MappingFile } from './mapping-file.contract.js'
import {
  deleteMappingFile,
  fetchMappingFile,
  uploadMappingFile,
} from './mapping-file.service.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 }, // 1 Mb
})

const validateMappingFile: RequestHandler = (req, res, next) => {
  try {
    yaml.parse(MappingFile.parse(req.file).buffer.toString())
    return next()
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).send(err).end()
  }
}

const router = tsRestServer.router(mappingFileContract, {
  uploadMappingFile: {
    middleware: [
      generateAuthenticationMiddleware(),
      upload.single('file'),
      validateMappingFile,
    ],
    handler: async ({ file, body, req }) => {
      try {
        return {
          body: await uploadMappingFile({
            // @ts-expect-error could not type req.file correctly as MappingFile (see middleware above)
            file,
            fileCreateDto: body,
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

        logger.error('Mapping File upload failed', err)
        return {
          body: {},
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        }
      }
    },
  },
  deleteMappingFile: {
    middleware: [generateAuthenticationMiddleware()],
    handler: async ({ params, req }) => {
      try {
        return {
          body: await deleteMappingFile({
            params,
            userScopes: req.apiUser!.scopes,
          }),
          status: StatusCodes.NO_CONTENT,
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

        logger.error('Mapping File deletion failed', err)
        return {
          body: {},
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        }
      }
    },
  },
  fetchMappingFile: {
    middleware: [generateAuthenticationMiddleware()],
    handler: async ({ params, req, res }) => {
      try {
        return {
          body: res.redirect(
            await fetchMappingFile({
              params,
              userScopes: req.apiUser!.scopes,
            })
          ),
          status: StatusCodes.MOVED_TEMPORARILY,
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

        logger.error('Mapping File fetch failed', err)
        return {
          body: {},
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        }
      }
    },
  },
})

export default router
