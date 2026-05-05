import { initContract } from '@ts-rest/core'
import authenticationContract from './authentication/authentication.contract.ts'
import emailWhitelistContract from './email-whitelist/email-whitelist.contract.ts'
import mappingFileContract from './mapping-file/mapping-file.contract.ts'
import mappingSituationContract from './mapping-situation/mapping-situation.contract.ts'

const c = initContract()

const contract = c.router({
  Authentication: authenticationContract,
  EmailWhitelist: emailWhitelistContract,
  MappingFile: mappingFileContract,
  MappingSituation: mappingSituationContract,
})

export default contract
