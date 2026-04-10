import {
  FIRST_OBJECTIVE,
  SECOND_OBJECTIVE,
  THIRD_OBJECTIVE,
} from '@/components/results/objective/_constants/objectives'
import { useMemo } from 'react'

const CURRENT_YEAR = new Date().getFullYear()

const FIRST_POINT = { x: 10, y: 10 }
const LAST_POINT = { x: 60, y: 80 }

// Pre-computed coordinates for 4 points (carbon > 7 T)
// Evenly spaced along a descending line, y range: 10→80.
const COORDS_4 = [
  FIRST_POINT,
  { x: 26.7, y: 33.3 },
  { x: 43.3, y: 56.7 },
  LAST_POINT,
]

// Pre-computed coordinates for 3 points (carbon ≤ 7 T)
const COORDS_3 = [FIRST_POINT, { x: 35, y: 45 }, LAST_POINT]

const COORDS_2 = [FIRST_POINT, LAST_POINT]

// SVG paths – last segment shortened slightly so the arrowhead
// reaches the outline of the last dot, not its center.
const LINE_PATH_4 = 'M 10 10 L 26.7 33.3 L 43.3 56.7 L 58.8 78.4'
const LINE_PATH_3 = 'M 10 10 L 35 45 L 58.8 78.4'
const LINE_PATH_2 = 'M 10 10 L 58.8 78.4'

export const useObjectiveChart = (carbonFootprint: number) => {
  const is4Points = carbonFootprint > FIRST_OBJECTIVE.value
  const is2Points = carbonFootprint <= SECOND_OBJECTIVE.value

  const pointsWithCoords = useMemo(() => {
    const coords = is4Points ? COORDS_4 : is2Points ? COORDS_2 : COORDS_3

    const milestonePoints = is4Points
      ? [FIRST_OBJECTIVE, SECOND_OBJECTIVE, THIRD_OBJECTIVE]
      : is2Points
        ? [THIRD_OBJECTIVE]
        : [SECOND_OBJECTIVE, THIRD_OBJECTIVE]

    return [
      {
        year: CURRENT_YEAR,
        value: carbonFootprint,
        isCurrent: true,
        ...coords[0],
      },
      ...milestonePoints.map((p, i) => ({
        ...p,
        ...coords[i + 1],
      })),
    ]
  }, [carbonFootprint, is4Points, is2Points])

  return {
    firstPoint: FIRST_POINT,
    lastPoint: LAST_POINT,
    linePath: is4Points ? LINE_PATH_4 : is2Points ? LINE_PATH_2 : LINE_PATH_3,
    pointsWithCoords,
  }
}
