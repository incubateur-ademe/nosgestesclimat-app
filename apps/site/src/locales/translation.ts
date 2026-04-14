/*
	This module contains all types and functions related to the translation.
*/

import type { LangInfos, YamlEntry } from '@/types/translation'
import { Lang } from '@/types/translation'
import type { i18n } from 'i18next'
import uiEnYaml from './ui/ui-en.yaml'
import uiFrYaml from './ui/ui-fr.yaml'
import unitsYaml from './units.yaml'

const parseYaml = (yaml: YamlEntry) => {
  //Remove keys that make the bundle heavier but are only useful for translation purposes, not in the UI
  return Array.isArray(yaml)
    ? yaml.map((entry) =>
        Object.fromEntries(
          Object.entries(entry).filter(([key]) => !key.endsWith('.lock'))
        )
      )
    : {
        entries: Object.fromEntries(
          Object.entries(yaml.entries ?? {}).filter(
            ([key]) => !key.endsWith('.lock')
          )
        ),
      }
}

const uiFr = parseYaml(uiFrYaml as unknown as YamlEntry)
const uiEn = parseYaml(uiEnYaml as unknown as YamlEntry)

function getLangInfos(lang: Lang): LangInfos {
  switch (lang) {
    case Lang.En: {
      return {
        name: 'English',
        abrv: 'en',
        abrvLocale: 'en',
        uiTrad: uiEn.entries as Record<string, unknown>,
      }
    }
    case Lang.Fr:
    default: {
      return {
        name: 'Français',
        abrv: 'fr',
        abrvLocale: 'fr-FR',
        uiTrad: uiFr.entries as Record<string, unknown>,
      }
    }
  }
}

function getLangFromAbreviation(abrv: string): Lang {
  switch (abrv?.slice(0, 2) ?? '') {
    case 'en':
      return Lang.En

    case 'fr':
    default:
      return Lang.Default
  }
}

export function getCurrentLangInfos(i18n: i18n): LangInfos {
  return getLangInfos(getLangFromAbreviation(i18n.language))
}

const enTranslation = {
  ...(uiEnYaml as unknown as YamlEntry).entries,
  ...((unitsYaml as unknown as Record<string, unknown>).en as Record<
    string,
    unknown
  >),
}
const frTranslation = {
  ...(uiFrYaml as unknown as YamlEntry).entries,
  ...((unitsYaml as unknown as Record<string, unknown>).fr as Record<
    string,
    unknown
  >),
}
export const translations: Record<string, Record<string, unknown>> = {
  en: enTranslation,
  fr: frTranslation,
}
