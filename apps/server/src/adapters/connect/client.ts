import axios from 'axios'
import axiosRetry from 'axios-retry'
import type { VerifiedUser } from '../prisma/generated.js'
import { config } from '../../config.js'
import { isNetworkOrTimeoutOrRetryableError } from '../../core/typeguards/isRetryableAxiosError.js'
import logger from '../../logger.js'

const { clientId, clientSecret, url } = config.thirdParty.connect
/**
 * Connect url is a full url in the environment
 * We use a URL to extract the baseUrl here
 * safe to remove once env is updated
 */

export const baseURL = new URL(url).origin

const connect = axios.create({
  baseURL,
  headers: {
    client_id: clientId,
    client_secret: clientSecret,
  },
  timeout: 1000,
})

axiosRetry(connect, {
  retryCondition: isNetworkOrTimeoutOrRetryableError,
  retryDelay: () => 200,
  shouldResetTimeout: true,
})

export const addOrUpdateContact = async ({
  email,
  name,
  position,
}: VerifiedUser) => {
  try {
    await connect.post('/api/v1/personnes', {
      email,
      nom: name,
      fonction: position,
      source: 'Nos gestes Climat',
    })
  } catch (err) {
    logger.warn('Connect(addOrUpdateContact): sync failed', err)
  }
}
