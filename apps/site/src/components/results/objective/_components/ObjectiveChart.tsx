'use client'

import Trans from '@/components/translation/trans/TransClient'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useLocale } from '@/hooks/useLocale'
import { motion, useReducedMotion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import { useObjectiveChart } from './_hooks/useObjectiveChart'

interface Props {
  carbonFootprint: number
  className?: string
}

export default function ObjectiveChart({ carbonFootprint, className }: Props) {
  const { t } = useClientTranslation()
  const locale = useLocale()
  const { firstPoint, lastPoint, linePath, pointsWithCoords } =
    useObjectiveChart(carbonFootprint)

  const shouldReduceMotion = useReducedMotion()
  return (
    <div
      className={twMerge(
        'bg-primary-100 mt-8 w-full overflow-visible rounded-xl px-8 pt-12 pb-6',
        className
      )}>
      <div className="relative flex aspect-[4/3] w-full items-center justify-center md:mx-auto md:max-w-[400px]">
        {/* SVG line */}
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 100 100">
          <motion.path
            d={linePath}
            fill="none"
            className="stroke-secondary-700"
            strokeWidth="0.8"
            initial={{
              pathLength: 0,
              opacity: 0,
            }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 1.5,
              ease: 'easeInOut',
            }}
          />
        </svg>

        {/* Animated arrow head */}
        <motion.div
          className="absolute h-4 w-4"
          initial={{
            left: `${firstPoint.x}%`,
            top: `${firstPoint.y}%`,
            opacity: 0,
          }}
          whileInView={{
            left: `${lastPoint.x}%`,
            top: `${lastPoint.y}%`,
            opacity: 1,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
          }}>
          <div
            style={{
              transform: 'rotate(46deg) translate(-18px, 2px)',
            }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              className="overflow-visible">
              <path
                d="M 2 1 L 8 6 L 2 11"
                fill="none"
                className="stroke-secondary-700"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </motion.div>

        {pointsWithCoords.map((p, index) => {
          const isLastPoint = index === pointsWithCoords.length - 1

          const { formattedValue, unit } = formatFootprint(p.value, {
            locale,
            t,
            shouldUseAbbreviation: !isLastPoint,
          })

          return (
            <div
              key={p.year}
              className="absolute flex flex-col items-center"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: 'translate(-50%, -50%)',
              }}>
              <div className="relative flex items-center justify-center">
                {
                  // Display pulsating animation on current dot
                  index === 0 && !shouldReduceMotion && (
                    <motion.div
                      className="bg-secondary-700 absolute rounded-full"
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        delay: 1.5,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  )
                }
                <div
                  className={twMerge(
                    'bg-secondary-700 relative z-10 rounded-full',
                    index === 0 ? 'h-5 w-5' : 'h-4 w-4'
                  )}
                />
              </div>

              <div
                className={twMerge(
                  'absolute flex w-max flex-col',
                  'bottom-2 left-5 items-start text-left',
                  p.year === 2050 && '-bottom-6'
                )}>
                <span className="text-secondary-700 text-xs font-bold md:text-sm">
                  {index === 0 ? (
                    <Trans>Vous aujourd'hui</Trans>
                  ) : p.year === 2050 ? (
                    <Trans>Objectif 2050</Trans>
                  ) : (
                    p.year
                  )}
                </span>
                <span className="text-primary-950 text-lg font-black md:text-2xl">
                  {p.year === 2050 ? (
                    <div className="flex flex-col sm:flex-row sm:gap-2">
                      <span>
                        <Trans>2 tonnes</Trans>
                      </span>{' '}
                      <span>
                        CO₂e&nbsp;/&nbsp;
                        <Trans i18nKey="results.year">an</Trans>
                      </span>
                    </div>
                  ) : (
                    `${formattedValue} ${unit}`
                  )}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-right text-sm italic">
        <Trans i18nKey="results.objective.chart.trajectory">
          Trajectoire proposée par Nos Gestes Climat
        </Trans>
      </p>
    </div>
  )
}
