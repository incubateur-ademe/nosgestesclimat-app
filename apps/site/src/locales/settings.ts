import {
  defaultNS,
  fallbackLng,
  languages,
} from '@/constants/localisation/translation'

export function getOptions(lng = fallbackLng, namespace = defaultNS) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns: namespace,
  }
}
