import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import logger from '../../logger.ts'
import { validateRequest } from '../../middlewares/validateRequest.ts'
import { getModeleCountry } from './geolocation.service.ts'
import { GeolocationFetchValidator } from './modele.validator.ts'

const router = express.Router()

/**
 * Fetches country code according to IP address
 */
router
  .route('/v1/geolocation')
  .get(validateRequest(GeolocationFetchValidator), (req, res) => {
    try {
      const country = getModeleCountry(req.clientIp)
      return res.status(StatusCodes.OK).json(country)
    } catch (err) {
      if (err instanceof EntityNotFoundException) {
        return res.status(StatusCodes.NOT_FOUND).send(err.message).end()
      }

      logger.error('Geolocation fetch failed', err)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
    }
  })

export default router
