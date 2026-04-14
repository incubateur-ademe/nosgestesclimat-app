export function areArraysEqual(
  array1: (string | number)[],
  array2: (string | number)[]
) {
  return (
    array1.length === array2.length &&
    array1.every((value, index) => value === array2[index])
  )
}
