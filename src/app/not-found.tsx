import Route404 from '@/components/layout/404'
import { noIndexObject } from '@/constants/metadata'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import i18nConfig from '@/i18nConfig'
import './[locale]/globals.css'
import { marianne } from './[locale]/marianne'

export function generateMetadata() {
  return getMetadataObject({
    locale: i18nConfig.defaultLocale,
    title: '404 - Nos Gestes Climat',
    description:
      "Oups, vous êtes bien sur Nos Gestes Climat, mais cette page n'existe pas.",
    robots: noIndexObject,
  })
}

export default function NotFound() {
  return (
    <html lang="fr">
      <body className={`${marianne.className} text-default bg-white`}>
        <Route404 locale={i18nConfig.defaultLocale} />
      </body>
    </html>
  )
}
