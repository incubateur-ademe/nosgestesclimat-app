// Brevo are evil
export const formatBrevoDate = (date: Date) => {
  const timezoneOffset = -date.getTimezoneOffset()
  const sign = timezoneOffset >= 0 ? '+' : '-'
  const hours = Math.floor(Math.abs(timezoneOffset) / 60)
    .toString()
    .padStart(2, '0')
  const minutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0')

  return `${date.toISOString().slice(0, -1)}${sign}${hours}:${minutes}`
}
