const VIEWBOX_WIDTH = 100
const VIEWBOX_HEIGHT = 100
const VIEWBOX_HEIGHT_HALF = 50
const VIEWBOX_CENTER_X = 50
const VIEWBOX_CENTER_Y = 50

function getPathDescription(pathRadius: number, counterClockwise?: boolean) {
  const radius = pathRadius
  const rotation = counterClockwise ? 1 : 0
  return `
      M ${VIEWBOX_CENTER_X},${VIEWBOX_CENTER_Y}
      m 0,-${radius}
      a ${radius},${radius} ${rotation} 1 1 0,${2 * radius}
      a ${radius},${radius} ${rotation} 1 1 0,-${2 * radius}
    `
}

function getDashStyle(
  pathRadius: number,
  dashRatio: number,
  counterClockwise?: boolean
) {
  const diameter = Math.PI * 2 * pathRadius
  const gapLength = (1 - dashRatio) * diameter
  return {
    strokeDasharray: `${diameter}px ${diameter}px`,
    strokeDashoffset: `${counterClockwise ? -gapLength : gapLength}px`,
  }
}

interface Props {
  value: number
  minValue?: number
  maxValue?: number
  strokeWidth?: number
  background?: boolean
  backgroundPadding?: number
  circleRatio?: number
  counterClockwise?: boolean
  className?: string
  text?: string
}

export default function CircularProgressbar({
  value,
  minValue = 0,
  maxValue = 100,
  strokeWidth = 8,
  background = false,
  backgroundPadding = 0,
  circleRatio = 1,
  counterClockwise = false,
  className = '',
  text,
}: Props) {
  const pathRadius = VIEWBOX_HEIGHT_HALF - strokeWidth / 2 - backgroundPadding

  const boundedValue = Math.min(Math.max(value, minValue), maxValue)
  const pathRatio = (boundedValue - minValue) / (maxValue - minValue)

  return (
    <svg
      className={`CircularProgressbar ${className}`}
      style={{ width: '100%', verticalAlign: 'middle' }}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      data-test-id="CircularProgressbar">
      {background && (
        <circle
          className="CircularProgressbar-background"
          style={{ fill: '#d6d6d6' }}
          cx={VIEWBOX_CENTER_X}
          cy={VIEWBOX_CENTER_Y}
          r={VIEWBOX_HEIGHT_HALF}
        />
      )}
      <path
        className="CircularProgressbar-trail"
        style={{
          stroke: '#d6d6d6',
          strokeLinecap: 'round',
          ...getDashStyle(pathRadius, circleRatio, counterClockwise),
        }}
        d={getPathDescription(pathRadius, counterClockwise)}
        strokeWidth={strokeWidth}
        fillOpacity={0}
      />
      <path
        className="CircularProgressbar-path"
        style={{
          stroke: '#d40d83',
          strokeLinecap: 'round',
          transition: 'stroke-dashoffset 0.5s ease 0s',
          ...getDashStyle(
            pathRadius,
            pathRatio * circleRatio,
            counterClockwise
          ),
        }}
        d={getPathDescription(pathRadius, counterClockwise)}
        strokeWidth={strokeWidth}
        fillOpacity={0}
      />
      {text && (
        <text
          className="CircularProgressbar-text"
          style={{
            fill: '#1a1a1a',
            fontSize: '16px',
            dominantBaseline: 'middle',
            textAnchor: 'middle',
          }}
          x={VIEWBOX_CENTER_X}
          y={VIEWBOX_CENTER_Y + 4}>
          {text}
        </text>
      )}
    </svg>
  )
}
