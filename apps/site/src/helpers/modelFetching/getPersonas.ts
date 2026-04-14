import type { Personas } from '@incubateur-ademe/nosgestesclimat'
import personasEN from '@incubateur-ademe/nosgestesclimat/public/personas-en.json'
import personasFR from '@incubateur-ademe/nosgestesclimat/public/personas-fr.json'
import { importPreviewFile } from './importPreviewFile'

const personasByLocale: Record<string, Personas> = {
  fr: personasFR as Personas,
  en: personasEN as Personas,
}

interface Props {
  locale?: string
  PRNumber?: string
}

/*
 * This function is used to get the personas. It can be called directly from a server component.
 */
export async function getPersonas(
  { locale = 'fr', PRNumber }: Props = {
    locale: 'fr',
  }
): Promise<Personas> {
  if (PRNumber) {
    const fileName = `personas-${locale}.json`
    return importPreviewFile({ fileName, PRNumber })
  }

  return Promise.resolve(personasByLocale[locale])
}
