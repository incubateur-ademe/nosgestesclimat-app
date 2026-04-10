import { StatusCodes } from 'http-status-codes'
import { tsRestServer } from '../../../../core/ts-rest.js'
import logger from '../../../../logger.js'
import mappingSituationContract from './mapping-situation.contract.js'
import { mapPartnerSituation } from './mapping-situation.service.js'

const router = tsRestServer.router(mappingSituationContract, {
  mapSituation: async ({ params, body, query }) => {
    try {
      return {
        body: await mapPartnerSituation({
          query,
          partner: params.partner,
          mappingSituationDto: body,
        }),
        status: StatusCodes.OK,
      }
    } catch (err) {
      logger.error('Mapping Situation failed', err)

      return {
        body: {},
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      }
    }
  },
})

export default router
