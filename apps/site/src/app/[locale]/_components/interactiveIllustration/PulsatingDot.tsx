'use client'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useContext, useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { FloatingElementDisplayedContext } from './FloatingElementDisplayedProvider'
import FloatingInfo from './pulsatingDot/FloatingInfo'

export default function PulsatingDot({
  className,
  carbonScore,
  waterScore,
  itemTitle,
  itemKey,
  floatingInfoOrientation,
  shouldDefaultDisplayFloatingInfo,
}: {
  className?: string
  carbonScore?: number
  waterScore?: number
  itemTitle: string
  itemKey: string
  floatingInfoOrientation?: 'left' | 'right'
  shouldDefaultDisplayFloatingInfo?: boolean
}) {
  const { floatingElementDisplayed, setFloatingElementDisplayed } = useContext(
    FloatingElementDisplayedContext
  )

  const { t } = useClientTranslation()

  const [isHovered, setIsHovered] = useState(false)

  // Default open the floating info if the user is on mobile and the shouldDefaultDisplayFloatingInfo is true
  useEffect(() => {
    if (/* isMobile() && */ shouldDefaultDisplayFloatingInfo) {
      setFloatingElementDisplayed(itemKey)
      setIsHovered(true)
    }
  }, [shouldDefaultDisplayFloatingInfo, itemKey, setFloatingElementDisplayed])

  // Close the floating info if the user clicks on another dot
  useEffect(() => {
    if (floatingElementDisplayed !== itemKey && isHovered) {
      setIsHovered(false)
    }
  }, [floatingElementDisplayed, itemKey, isHovered])

  const handleEnter = () => {
    setIsHovered(true)
    setFloatingElementDisplayed(itemKey)
  }

  const handleLeave = () => {
    setIsHovered(false)
  }

  return (
    <div className={twMerge('absolute', className)}>
      {isHovered && (
        <FloatingInfo
          title={itemTitle}
          carbonScore={carbonScore}
          waterScore={waterScore}
          orientation={floatingInfoOrientation}
          className="animate-fade-in top-0 left-0 motion-reduce:animate-none"
          key={`${itemKey}-floating-info`}
        />
      )}

      <div
        className={twMerge(
          'group focus:ring-primary-700 absolute h-6 w-6 cursor-pointer rounded-full bg-white shadow-lg focus:ring-2 focus:ring-offset-3 focus:outline-hidden'
        )}
        tabIndex={0}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        role="button"
        onTouchStart={handleEnter}
        title={`${t(
          'homePage.interactiveIllustration.itemTitle',
          '{{itemTitle}} : empreinte carbone notée {{carbonScore}} sur 5',
          { itemTitle, carbonScore }
        )}${
          waterScore
            ? t(
                'homePage.interactiveIllustration.waterScore',
                ' et empreinte eau notée {{waterScore}} sur 5',
                {
                  waterScore,
                }
              )
            : ''
        }`}
        aria-label={`${t(
          'homePage.interactiveIllustration.itemTitle',
          '{{itemTitle}} : empreinte carbone notée {{carbonScore}} sur 5',
          { itemTitle, carbonScore }
        )}${
          waterScore
            ? t(
                'homePage.interactiveIllustration.waterScore',
                ' et empreinte eau notée {{waterScore}} sur 5',
                {
                  waterScore,
                }
              )
            : ''
        }`}>
        <div
          className={twMerge(
            'bg-secondary-600 absolute inset-0 scale-[0.15] rounded-full transition-all duration-500',
            isHovered
              ? 'scale-[0.7]'
              : 'scale-[0.7] animate-[pulse-scale_3s_ease-in-out_infinite] motion-reduce:animate-none'
          )}
        />
      </div>
    </div>
  )
}
