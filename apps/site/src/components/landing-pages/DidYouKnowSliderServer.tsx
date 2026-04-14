import { isUserAuthenticated } from '@/helpers/server/model/user'
import { type ComponentProps } from 'react'
import DidYouKnowSlider from './DidYouKnowSlider'

export default async function DidYouKnowSliderServer(
  props: Omit<ComponentProps<typeof DidYouKnowSlider>, 'isAuthenticated'>
) {
  const isAuthenticated = await isUserAuthenticated()
  return <DidYouKnowSlider {...props} isAuthenticated={isAuthenticated} />
}
