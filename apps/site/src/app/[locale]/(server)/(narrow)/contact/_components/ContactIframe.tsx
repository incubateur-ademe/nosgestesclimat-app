'use client'

import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useLocale } from '@/hooks/useLocale'

export function ContactIframe() {
  const { t } = useClientTranslation()

  const locale = useLocale()

  return (
    <iframe
      data-tally-src={`https://tally.so/embed/${locale === 'fr' ? 'w59G1Z' : 'gDZ00J'}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
      loading="lazy"
      id="iframe-contact"
      // This title is overwritten by Tally
      title={t(
        'contact.iframe.title.fr',
        'Formulaire - nous faire part de vos remarques sur le site'
      )}
      onLoad={() => {
        if (typeof window === 'undefined') return

        const iframe = document.querySelector('#iframe-contact')
        if (iframe) {
          iframe.setAttribute(
            'title',
            locale === 'fr'
              ? t(
                  'contact.iframe.title.fr',
                  'Formulaire - nous faire part de vos remarques sur le site'
                )
              : t(
                  'contact.iframe.title.en',
                  'Formulaire - give some feedback about Nos Gestes Climat'
                )
          )
        }
      }}></iframe>
  )
}
