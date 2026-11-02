/**
 * CSV format of the sub-category export: `;` separator, French decimal comma,
 * RFC 4180 escaping. Downstream analysis tools depend on it: do not change it.
 */

import { formatValue } from 'publicodes'

export const DELIMITER = ';'

/** Escapes a value for an RFC 4180 CSV. */
export const csvEscape = (value: unknown): string => {
  const str = value == null ? '' : String(value)
  const needsQuotes = str.includes(DELIMITER) || /["\n\r]/.test(str)
  return needsQuotes ? `"${str.replace(/"/g, '""')}"` : str
}

/**
 * Formats a number with Publicodes `formatValue` (French convention).
 * Publicodes groups thousands with a narrow no-break space (`U+202F`) that
 * spreadsheets cannot parse, so it is stripped.
 */
export const formatNumber = (value: number): string =>
  formatValue(value, { language: 'fr', precision: 1 }).replace(
    /[\u202F\u00A0\s]/g,
    ''
  )
