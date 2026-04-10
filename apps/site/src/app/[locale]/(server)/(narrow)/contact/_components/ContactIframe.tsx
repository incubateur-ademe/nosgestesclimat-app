'use client'

import { useClientTranslation } from '@/hooks/useClientTranslation'

export function ContactIframe() {
  const { t } = useClientTranslation()

  return (
    <iframe
      data-tally-src="https://tally.so/embed/w59G1Z?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
      loading="lazy"
      id="iframe-contact"
      // This title is overwritten by Tally
      title={t('Formulaire - nous faire part de vos remarques sur le site')}
      onLoad={() => {
        if (typeof window === 'undefined') return

        const iframe = document.querySelector('#iframe-contact')
        if (iframe) {
          iframe.setAttribute(
            'title',
            t('Formulaire - nous faire part de vos remarques sur le site')
          )
        }
      }}></iframe>
  )
}
