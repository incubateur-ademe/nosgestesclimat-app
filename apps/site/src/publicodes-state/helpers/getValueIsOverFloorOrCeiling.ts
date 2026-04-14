interface Props {
  value?: number | null
  plafond?: number
  plancher?: number
}

export default function getValueIsOverFloorOrCeiling({
  value,
  plafond,
  plancher,
}: Props): {
  isOverCeiling: boolean
  isBelowFloor: boolean
} {
  return {
    isOverCeiling:
      value !== undefined &&
      value !== null &&
      plafond !== undefined &&
      value > plafond,
    isBelowFloor:
      value !== undefined &&
      value !== null &&
      plancher !== undefined &&
      value < plancher,
  }
}
