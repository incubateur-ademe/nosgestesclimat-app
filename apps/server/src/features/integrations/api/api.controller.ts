import { tsRestServer } from '../../../core/ts-rest.ts'
import apiContract from './api.contract.ts'
import authenticationRouter from './authentication/authentication.controller.ts'
import emailWhitelistRouter from './email-whitelist/email-whitelist.controller.ts'
import mappingFileRouter from './mapping-file/mapping-file.controller.ts'
import mappingSituationRouter from './mapping-situation/mapping-situation.controller.ts'

const router = tsRestServer.router(apiContract, {
  Authentication: authenticationRouter,
  EmailWhitelist: emailWhitelistRouter,
  MappingFile: mappingFileRouter,
  MappingSituation: mappingSituationRouter,
})

export default router
