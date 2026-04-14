export function roundValue(value: number) {
  switch (true) {
    case value < 50:
      return value
    case value < 200:
      return Math.ceil(value / 10) * 10
    default:
      return Math.ceil(value / 50) * 50
  }
}
