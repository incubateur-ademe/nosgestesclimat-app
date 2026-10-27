/**
 * Format du CSV de sous catégories : séparateur `;`, convention française
 * (virgule décimale), échappement RFC 4180.
 *
 * C'est le format attendu par les outils d'analyse des postes
 * (Ravijen, page de fin, import PostHog) : ne pas le faire évoluer sans eux.
 */

import { formatValue } from 'publicodes'

export const DELIMITER = ';'

/** Échappe une valeur pour un CSV au format RFC 4180. */
export const csvEscape = (value: unknown): string => {
  const str = value == null ? '' : String(value)
  const needsQuotes = str.includes(DELIMITER) || /["\n\r]/.test(str)
  return needsQuotes ? `"${str.replace(/"/g, '""')}"` : str
}

/**
 * Formate un nombre via `formatValue` de Publicodes (convention française).
 *
 * Publicodes groupe les milliers avec une espace fine insécable (`U+202F`), ce
 * qui rendrait la valeur ininterprétable par un tableur : on la retire.
 */
export const formatNumber = (value: number): string =>
  formatValue(value, { language: 'fr', precision: 1 }).replace(
    /[\u202F\u00A0\s]/g,
    ''
  )
