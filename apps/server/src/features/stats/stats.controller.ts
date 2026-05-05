import express from 'express'
import { StatusCodes } from 'http-status-codes'
import logger from '../../logger.ts'
import { validateRequest } from '../../middlewares/validateRequest.ts'
import { fetchNorthstarStats } from './stats.service.ts'
import { NorthstarStatsFetchValidator } from './stats.validator.ts'

const router = express.Router()

/**
 * Returns northstar stats for a given period
 */
router
  .route('/v1/northstar')
  .get(validateRequest(NorthstarStatsFetchValidator), async (req, res) => {
    try {
      const stats = await fetchNorthstarStats(req.query)

      return res.status(StatusCodes.OK).json(stats)
    } catch (err) {
      logger.error('Northstar stats fetch failed', err)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
    }
  })

export default router
