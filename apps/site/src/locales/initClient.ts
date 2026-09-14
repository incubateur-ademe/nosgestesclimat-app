'use client'

import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getOptions } from './settings'
import { translations } from './translation'

// La langue de l'instance est la langue par défaut : elle est rendue **aussi
// bien par le serveur que par le client**, qui ne peuvent pas lire le même
// cookie au même moment (le serveur n'a pas `document`). S'en servir pour
// choisir la langue faisait diverger le premier rendu client du HTML du
// serveur — un mismatch d'hydratation sur les textes (visible sur `/en` et `/`,
// en changeant de langue). Les composants lisent la langue de l'URL via
// `useClientTranslation`, qui passe `lng` explicitement.
void i18next.use(initReactI18next).init({
  ...getOptions(),
  resources: {
    en: {
      translation: translations.en,
    },
    fr: {
      translation: translations.fr,
    },
  },
})
