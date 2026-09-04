export function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Renders a conic (radial) gradient of the rainbow palette on a canvas and
// returns it as a data URL, so it can be used as an SVG pattern fill.
export function buildConicGradientDataUrl(size = 256): string {
  if (typeof window === 'undefined') return ''

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const cx = size / 2
  const cy = size / 2

  // Paint one triangle per small angular step to fake a conic gradient.
  const steps = 360
  const colorStops = ['#F54900', '#D40D83']
  for (let step = 0; step < steps; step++) {
    const angle = (step / steps) * Math.PI * 2
    const nextAngle = ((step + 1) / steps) * Math.PI * 2
    const position = step / steps

    // Interpolate the rainbow color at this angle.
    const t = position * colorStops.length
    const index = Math.floor(t) % colorStops.length
    const nextIndex = (index + 1) % colorStops.length
    const local = t - Math.floor(t)
    const from = hexToRgb(colorStops[index])
    const to = hexToRgb(colorStops[nextIndex])
    const r = Math.round(from[0] + (to[0] - from[0]) * local)
    const g = Math.round(from[1] + (to[1] - from[1]) * local)
    const b = Math.round(from[2] + (to[2] - from[2]) * local)

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    // Extend well beyond the canvas so the whole circle is covered.
    const far = size
    ctx.lineTo(cx + Math.cos(angle) * far, cy + Math.sin(angle) * far)
    ctx.lineTo(cx + Math.cos(nextAngle) * far, cy + Math.sin(nextAngle) * far)
    ctx.closePath()
    ctx.fill()
  }

  return canvas.toDataURL('image/png')
}

export function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

export function getBarTipValues({
  center,
  radius,
  progress,
  value,
  strokeWidth,
}: {
  center: number
  radius: number
  progress: number
  value: number
  strokeWidth: number
}) {
  // Position of the tip of the trace, clockwise from the top. The white tip
  // cap (and its shadow) is drawn here to mark the level difference between
  // the lap below and the lap on top.
  const tipAngle = ((progress * value) / 100) * 2 * Math.PI
  const tipX = center + radius * Math.sin(tipAngle)
  const tipY = center - radius * Math.cos(tipAngle)

  // Half-ring at the tip: only the curved front part of the rounded bar end,
  // as a white stroke (transparent inside), pointing in the direction of the
  // progression. It borders where the bar on top overlaps the lap underneath,
  // and carries the drop shadow.
  //
  // The arc is built in a frame centered on the tip, spanning the front half
  // of a circle (from -90° to +90° in screen coords, so it bulges towards +x),
  // then rotated by the progression angle so the bulge follows the bar.
  const tipRadius = strokeWidth / 2
  const tipRotation = (tipAngle * 180) / Math.PI
  const tipCapD =
    `M ${tipX.toFixed(2)},${(tipY - tipRadius).toFixed(2)}` +
    ` A ${tipRadius},${tipRadius} 0 0 1 ${tipX.toFixed(2)},${(tipY + tipRadius).toFixed(2)}`

  return {
    tipCapD,
    tipRotation,
    tipX,
    tipY,
  }
}

const FULL_PERCENTAGE = 100

export function getComputedValues({
  progress,
  isOverflow,
  value,
  fullCirclePathD,
  circumference,
}: {
  progress: number
  isOverflow: boolean
  value: number
  fullCirclePathD: string
  circumference: number
}) {
  // The whole progression lives on one single ring. Above 100%, the trace
  // starts a new lap on top of the previous one (same lane), drawn again so it
  // overlaps visually. Each lap is a full circle appended to the path
  const lapCount = Math.max(
    Math.ceil(progress * (isOverflow ? value / 100 : 0)),
    1
  )
  let progressPathD = ''
  for (let lap = 0; lap < lapCount; lap++) {
    progressPathD += fullCirclePathD
  }
  const pathLength = lapCount * circumference

  return {
    pathLength,
    progressPathD,
    offsetSingleLap:
      (1 - Math.min((progress * value) / FULL_PERCENTAGE, 1)) * circumference,
    offsetOverflow: (1 - progress) * pathLength,
  }
}
