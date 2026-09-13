export function formatPollStatsRefreshDuration(
  cooldownSeconds: number,
  locale: string
): string | null {
  if (cooldownSeconds <= 0) return null
  const inHours = cooldownSeconds % 3600 === 0
  const unit = inHours ? 'hour' : 'minute'
  const divisor = inHours ? 3600 : 60
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit,
    unitDisplay: 'long',
  }).format(Math.round(cooldownSeconds / divisor))
}
