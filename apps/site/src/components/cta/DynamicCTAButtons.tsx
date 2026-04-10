import { isUserAuthenticated } from '@/helpers/server/model/user'
import type { ComponentProps } from 'react'
import ClientCTAButtons from './ClientCTAButtons'

export default async function DynamicCTAButtons(
  props: Omit<ComponentProps<typeof ClientCTAButtons>, 'isAuthenticated'>
) {
  const isAuthenticated = await isUserAuthenticated()
  return <ClientCTAButtons {...props} isAuthenticated={isAuthenticated} />
}
