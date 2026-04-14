import type { ComponentProps } from 'react'
import FooterServer from './footer/FooterServer'
import HideInIframe from './HideInIframe'

type Props = ComponentProps<typeof FooterServer>

export default function Footer({ backgroundColor, locale, params }: Props) {
  return (
    <HideInIframe>
      <FooterServer
        backgroundColor={backgroundColor}
        locale={locale}
        params={params}
      />
    </HideInIframe>
  )
}
