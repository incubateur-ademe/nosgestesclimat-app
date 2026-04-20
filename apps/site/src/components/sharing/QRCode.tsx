'use client'

import Trans from '@/components/translation/trans/TransClient'

import { captureDownloadPollQRCode } from '@/constants/tracking/posthogTrackers'
import Button from '@/design-system/buttons/Button'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import JSZip from 'jszip'
import { useRef } from 'react'
import QRCodeLib from 'react-qr-code'
import { twMerge } from 'tailwind-merge'

interface QRCodeProps {
  value: string
  className?: string
}

export default function QRCode({ value, className }: QRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  const downloadQRCodeZip = () => {
    if (!qrRef.current) return

    const svg = qrRef.current.querySelector('svg')
    if (!svg) return

    trackPosthogEvent(captureDownloadPollQRCode)

    const zip = new JSZip()

    // Get SVG content
    const svgData = new XMLSerializer().serializeToString(svg)
    zip.file('qrcode.svg', svgData)

    // Create PNG version
    const qrElement = qrRef.current
    const rect = qrElement.getBoundingClientRect()
    const padding = rect.width * 0.2
    const scale = 4
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { alpha: false })

    if (!ctx) return

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    canvas.width = (rect.width + padding * 2) * scale
    canvas.height = (rect.height + padding * 2) * scale
    ctx.scale(scale, scale)

    // Set white background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, rect.width + padding * 2, rect.height + padding * 2)

    const img = new Image()

    img.onload = () => {
      ctx.drawImage(img, padding, padding, rect.width, rect.height)

      // Convert to PNG blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            zip.file('qrcode.png', blob)

            // Generate and download zip
            zip.generateAsync({ type: 'blob' }).then((zipBlob) => {
              const downloadLink = document.createElement('a')
              downloadLink.download = 'qrcode.zip'
              downloadLink.href = URL.createObjectURL(zipBlob)
              downloadLink.click()

              // Clean up the object URL
              setTimeout(() => URL.revokeObjectURL(downloadLink.href), 100)
            })
          }
        },
        'image/png',
        1.0
      )
    }

    const encodedSvg = encodeURIComponent(svgData)
    img.src = `data:image/svg+xml;charset=utf-8,${encodedSvg}`
  }

  return (
    <div
      data-testid="qrcode-container"
      className={twMerge(
        'flex flex-row items-center gap-4 md:gap-6',
        className
      )}>
      <div
        ref={qrRef}
        data-testid="qrcode-wrapper"
        className="w-20 rounded-xl border-2 border-gray-200 bg-white p-2 md:w-28 md:p-4">
        <QRCodeLib
          data-testid="qrcode-svg"
          value={value}
          style={{
            height: 'auto',
            maxWidth: '100%',
            width: '200px',
            background: 'white',
          }}
          fgColor="#373978"
        />
      </div>
      <Button
        data-testid="qrcode-download-button"
        color="secondary"
        className="px-3"
        size="sm"
        onClick={downloadQRCodeZip}>
        <span className="whitespace-normal">
          <Trans>Télécharger le QR Code</Trans>
        </span>
      </Button>
    </div>
  )
}
