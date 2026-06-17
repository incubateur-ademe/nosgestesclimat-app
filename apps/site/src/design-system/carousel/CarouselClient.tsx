'use client'

import { Children, forwardRef, useRef, useState } from 'react'
import { A11y, Keyboard, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperInstance } from 'swiper/types'

import ChevronLeft from '@/components/icons/ChevronLeft'
import ChevronRight from '@/components/icons/ChevronRight'
import Button from '@/design-system/buttons/Button'
import { twMerge } from 'tailwind-merge'
import './Carousel.css'

export interface CarouselTranslations {
  prevSlideMessage: string
  nextSlideMessage: string
  firstSlideMessage: string
  lastSlideMessage: string
  paginationBulletMessage: string
  itemRoleDescriptionMessage: string
}

interface CarouselClientProps {
  children: React.ReactNode
  className?: string
  slideClassName?: string
  translations: CarouselTranslations
  showMobileNav?: boolean
  slidesPerGroup?: number
  slidesPerGroupDesktop?: number
}

export default function CarouselClient({
  children,
  className,
  slideClassName,
  translations,
  showMobileNav = false,
  slidesPerGroup,
  slidesPerGroupDesktop,
}: CarouselClientProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null)
  const prevButton = useRef(null)
  const nextButton = useRef(null)

  return (
    <>
      <NavigationButton
        ref={prevButton}
        className={twMerge(
          !isInitialized && 'pointer-events-none opacity-0',
          'left-2 md:-left-2 md:-translate-x-1/2 xl:-left-5'
        )}>
        <ChevronLeft />
      </NavigationButton>
      <NavigationButton
        ref={nextButton}
        className={twMerge(
          !isInitialized && 'pointer-events-none opacity-0',
          'right-2 md:-right-2 md:translate-x-1/2 xl:-right-5'
        )}>
        <ChevronRight />
      </NavigationButton>
      <Swiper
        className={className}
        modules={[Navigation, Keyboard, A11y]}
        navigation={{
          addIcons: false,
        }}
        keyboard={{
          enabled: true,
        }}
        a11y={translations}
        spaceBetween={8}
        slidesPerView="auto"
        slidesPerGroupAuto={
          slidesPerGroup == null && slidesPerGroupDesktop == null
        }
        slidesPerGroup={slidesPerGroup ?? 1}
        breakpoints={
          slidesPerGroupDesktop != null
            ? {
                768: {
                  slidesPerGroup: slidesPerGroupDesktop,
                  slidesPerGroupAuto: false,
                },
              }
            : undefined
        }
        onInit={() => {
          setIsInitialized(true)
        }}
        onSwiper={setSwiper}
        onBeforeInit={(swiper) => {
          // Assign refs before Swiper initializes
          const navigation =
            typeof swiper.params.navigation === 'boolean'
              ? { enabled: swiper.params.navigation }
              : (swiper.params.navigation ?? {})
          navigation.prevEl = prevButton.current
          navigation.nextEl = nextButton.current
          swiper.params.navigation = navigation
        }}>
        {Children.map(children, (child) => {
          return (
            <SwiperSlide
              className={twMerge(
                !isInitialized && 'mr-2', // Same value as `spaceBetween` to prevent layout shift before initialization
                'h-auto w-3/4 max-w-55 sm:w-62 sm:max-w-none',
                slideClassName
              )}>
              {child}
            </SwiperSlide>
          )
        })}
      </Swiper>
      {showMobileNav && (
        <div className="mt-4 flex items-center justify-center gap-4 md:hidden">
          <Button
            onClick={() => swiper?.slidePrev()}
            color="secondary"
            className="h-11 w-11 p-0!"
            aria-label={translations.prevSlideMessage}>
            <ChevronLeft />
          </Button>
          <Button
            onClick={() => swiper?.slideNext()}
            color="secondary"
            className="h-11 w-11 p-0!"
            aria-label={translations.nextSlideMessage}>
            <ChevronLeft className="rotate-180" />
          </Button>
        </div>
      )}
    </>
  )
}

const NavigationButton = forwardRef(function NavigationButtonWithRef(
  { className, ...props }: React.ComponentPropsWithoutRef<'button'>,
  ref: React.Ref<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      className={twMerge(
        'absolute top-1/2 z-10 hidden -translate-y-1/2 md:flex',
        'border-primary-700 h-11 w-11 items-center justify-center rounded-full border-2 bg-white text-blue-500 transition-all',
        'focus:outline-primary-700 hover:scale-110 disabled:opacity-0',
        className
      )}
      ref={ref}
      type="button"
    />
  )
})
