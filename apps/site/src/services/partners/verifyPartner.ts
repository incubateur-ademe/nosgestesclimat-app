'use server'

import { INTEGRATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'

export async function verifyPartner(partner: string) {
  return await fetchServer(`${INTEGRATION_URL}/${partner}`).catch(
    () => undefined
  )
}
