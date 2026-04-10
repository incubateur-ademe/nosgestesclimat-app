export const removePercentageFromString = (value: string) => {
  const percentRegex = /^[0-9% ]*/
  const newValue = value?.replace(percentRegex, '')
  return newValue
}
