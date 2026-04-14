import { INTEGRATION_URL } from '@/constants/urls/main'
import { captureException } from '@sentry/nextjs'
import axios from 'axios'

export async function verifyPartner(partner: string) {
  try {
    // If request is successful, the partner is verified
    const { data } = await axios.get(`${INTEGRATION_URL}/${partner}`)

    return data
  } catch (err) {
    captureException(err)
    return undefined
  }
}
