import { initContract } from '@ts-rest/core'
import authenticationContract from './authentication/authentication.contract.js'
import emailWhitelistContract from './email-whitelist/email-whitelist.contract.js'
import mappingFileContract from './mapping-file/mapping-file.contract.js'
import mappingSituationContract from './mapping-situation/mapping-situation.contract.js'

const c = initContract()

const contract = c.router({
  Authentication: authenticationContract,
  EmailWhitelist: emailWhitelistContract,
  MappingFile: mappingFileContract,
  MappingSituation: mappingSituationContract,
})

export default contract
