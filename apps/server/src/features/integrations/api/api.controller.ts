import { tsRestServer } from '../../../core/ts-rest.js'
import apiContract from './api.contract.js'
import authenticationRouter from './authentication/authentication.controller.js'
import emailWhitelistRouter from './email-whitelist/email-whitelist.controller.js'
import mappingFileRouter from './mapping-file/mapping-file.controller.js'
import mappingSituationRouter from './mapping-situation/mapping-situation.controller.js'

const router = tsRestServer.router(apiContract, {
  Authentication: authenticationRouter,
  EmailWhitelist: emailWhitelistRouter,
  MappingFile: mappingFileRouter,
  MappingSituation: mappingSituationRouter,
})

export default router
