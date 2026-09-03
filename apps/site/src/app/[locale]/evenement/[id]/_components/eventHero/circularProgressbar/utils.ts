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
