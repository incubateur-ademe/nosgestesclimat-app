export const getFormattedDate = (date: Date, abrvLocale: string) =>
  date.toLocaleString(abrvLocale, {
    year: 'numeric',
    month: 'long',
  })
