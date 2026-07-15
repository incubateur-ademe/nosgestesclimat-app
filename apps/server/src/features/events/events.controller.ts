import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { getEventInfo } from './events.service.ts'

const router = express.Router()

router.route('/v1/:id/info').get(async (req, res) => {
  try {
    const eventId = req.params.id
    const info = await getEventInfo(eventId)

    return res.status(StatusCodes.OK).json(info)
  } catch (e) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch event info',
    })
  }
})

export default router
