/**
 * Truncates a string in the middle with an ellipsis if it exceeds maxLength.
 * Useful for displaying long emails, names, or addresses.
 */
export function truncateMiddle(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text

  return `${text.substring(0, maxLength)}…`
}
