'use client'

import Button from '@/design-system/buttons/Button'
import ColorLine from '@/design-system/layout/ColorLine'
import Separator from '@/design-system/layout/Separator'
import {
  getLandingDidYouKnowSlider,
  getLandingDidYouKnowSliderPosthog,
  getLandingDidYouKnowSliderValue,
} from '@/helpers/tracking/landings'
import { useClientTranslation } from '@/hooks/useClientTranslation'
// @ts-expect-error package types are wrongly exported
import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide'
import '@splidejs/react-splide/css'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import ClientCTAButtons from '../cta/ClientCTAButtons'
import PlaySignIcon from '../icons/PlaySignIcon'
import Trans from '../translation/trans/TransClient'

export default function DidYouKnowSlider({
  slides,
  isAuthenticated,
  className,
  titleTag = 'h2',
}: {
  slides: { illustration: string; content: ReactNode; highlight?: ReactNode }[]
  className?: string
  isAuthenticated: boolean
  titleTag?: 'h2' | 'h3'
}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const splideRef = useRef<{ splide: { root: Element } } | null>(null)

  const { t } = useClientTranslation()

  const pathname = usePathname()

  const Title = titleTag === 'h2' ? 'h2' : 'h3'

  // Personnaliser les attributs ARIA et autres propriétés après le montage
  useEffect(() => {
    if (splideRef.current) {
      const splide = splideRef.current.splide

      const prevButton = splide.root.querySelector('.splide__arrow--prev')
      const nextButton = splide.root.querySelector('.splide__arrow--next')

      if (prevButton) {
        prevButton.setAttribute(
          'aria-label',
          t(
            'common.slider.buttons.previous',
            'Aller à la diapositive précédente'
          )
        )
        prevButton.setAttribute(
          'title',
          t(
            'common.slider.buttons.previous',
            'Aller à la diapositive précédente'
          )
        )
      }

      if (nextButton) {
        nextButton.setAttribute(
          'aria-label',
          t('common.slider.buttons.next', 'Aller à la diapositive suivante')
        )
        nextButton.setAttribute(
          'title',
          t('common.slider.buttons.next', 'Aller à la diapositive suivante')
        )
      }

      // Personnaliser les boutons de pagination
      const paginationButtons = splide.root.querySelectorAll(
        '.splide__pagination__page'
      )
      paginationButtons.forEach((button: Element, index: number) => {
        button.setAttribute(
          'aria-label',
          t(
            'common.slider.buttons.pagination',
            'Aller à la diapositive numéro {{number}}',
            {
              number: index + 1,
            }
          )
        )
        // Ajouter des attributs personnalisés pour le slide actuel
        if (index === currentSlide) {
          button.setAttribute('aria-current', 'true')
          button.setAttribute('data-active', 'true')
          button.setAttribute(
            'title',
            t(
              'common.slider.buttons.pagination',
              'Aller à la diapositive numéro {{number}} - actif',
              {
                number: index + 1,
              }
            )
          )
        } else {
          button.setAttribute('aria-current', 'false')
          button.setAttribute('data-active', 'false')
          button.setAttribute(
            'title',
            t(
              'common.slider.buttons.pagination',
              'Aller à la diapositive numéro {{number}}',
              {
                number: index + 1,
              }
            )
          )
        }
      })
    }
  }, [currentSlide, t])

  return (
    <div
      className={twMerge(
        'bg-heroLightBackground relative pt-16 pb-20',
        className
      )}>
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-10 lg:flex-row lg:gap-0">
        <Splide
          aria-label={t('Le saviez vous ?')}
          ref={splideRef}
          options={{
            autoplay: true,
            pauseOnHover: true,
            pauseOnFocus: true,
            pauseOnInteraction: false,
            rewind: true,
            interval: 5500,
            reducedMotion: true,
            classes: {
              arrow: 'splide__arrow custom-arrow',
              prev: 'splide__arrow--prev custom-prev',
              next: 'splide__arrow--next custom-next',
              pagination: 'splide__pagination custom-pagination',
              page: 'splide__pagination__page custom-page',
            },
            a11y: {
              container: 'slider-container',
              items: 'slider-items',
              prev: 'slider-prev',
              next: 'slider-next',
              pagination: 'slider-pagination',
              page: 'slider-page',
            },
          }}
          hasTrack={false}
          onMoved={(slide: unknown, nextSlideIndex: number) =>
            setCurrentSlide(nextSlideIndex)
          }
          onAutoplayPlay={(slide: unknown, nextSlideIndex: number) =>
            setCurrentSlide(nextSlideIndex)
          }
          className="relative max-w-[594px]"
          role="group">
          <SplideTrack aria-live="polite">
            {slides.map((slide, index) => (
              <SplideSlide
                role="group"
                className="mx-auto flex! w-full max-w-[90vw] flex-col items-start gap-10 md:flex-row"
                key={`slide-${index}`}
                aria-label={t(
                  'common.slider.slide.ariaLabel',
                  'Diapositive {{index}} sur {{length}}',
                  {
                    index: index + 1,
                    length: slides.length,
                  }
                )}>
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white md:mx-0 md:h-40 md:w-40">
                  <Image
                    src={slide.illustration}
                    className="w-12 md:w-20"
                    alt=""
                    width="80"
                    height="80"
                  />
                </div>

                <div className="w-full flex-1">
                  <Title className="text-center text-xl md:text-left md:text-3xl">
                    <Trans>Le saviez vous ?</Trans>
                  </Title>

                  <Separator className="mx-auto my-4 md:mx-0" />

                  <p className="mb-2 text-center text-sm md:text-left md:text-lg">
                    {slide.content}
                  </p>

                  <p className="text-secondary-700 mt-4 mb-0 pb-4 text-center text-sm font-bold md:text-left md:text-lg">
                    {slide.highlight}
                  </p>
                </div>
              </SplideSlide>
            ))}
          </SplideTrack>

          <Button
            tabIndex={0}
            color="secondary"
            title={
              isPlaying ? t('Arrêter le défilement') : t('Lancer le défilement')
            }
            className="splide__toggle"
            onClick={() => setIsPlaying((prev) => !prev)}
            type="button">
            {isPlaying ? (
              <span className="flex items-center gap-1">
                <span className="h-[24px]! text-2xl leading-6!" aria-hidden>
                  &#x23F9;
                </span>
                 
                <span className="text-sm">
                  {t('common.slider.stop', 'Arrêter')}
                </span>
              </span>
            ) : (
              <>
                <PlaySignIcon className="fill-primary-800 stroke-primary-800 block w-5" />
                <span className="ml-2 text-sm">
                  {t('common.slider.play', 'Lecture')}
                </span>
              </>
            )}
          </Button>
          <div className="splide__arrows" />
          <div className="splide__progress">
            <div className="splide__progress__bar" />
          </div>
        </Splide>
        <div>
          <ClientCTAButtons
            isAuthenticated={isAuthenticated}
            trackingEvents={{
              start: getLandingDidYouKnowSlider(
                pathname,
                getLandingDidYouKnowSliderValue(currentSlide + 1)
              ),
              resume: getLandingDidYouKnowSlider(
                pathname,
                getLandingDidYouKnowSliderValue(currentSlide + 1)
              ),
              results: getLandingDidYouKnowSlider(
                pathname,
                getLandingDidYouKnowSliderValue(currentSlide + 1)
              ),
              startPosthog: getLandingDidYouKnowSliderPosthog(
                pathname,
                getLandingDidYouKnowSliderValue(currentSlide + 1)
              ),
              resumePosthog: getLandingDidYouKnowSliderPosthog(
                pathname,
                getLandingDidYouKnowSliderValue(currentSlide + 1)
              ),
              resultsPosthog: getLandingDidYouKnowSliderPosthog(
                pathname,
                getLandingDidYouKnowSliderValue(currentSlide + 1)
              ),
            }}
            withRestart={false}
          />
        </div>
      </div>

      <ColorLine className="bg-rainbow animate-rainbow-slow absolute bottom-0 left-0 h-[4px] w-[100%] transition-all motion-reduce:animate-none" />
    </div>
  )
}
