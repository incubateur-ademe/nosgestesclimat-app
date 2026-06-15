'use client'

import { Children, forwardRef, useRef, useState } from 'react'
import { A11y, Keyboard, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import ChevronLeft from '@/components/icons/ChevronLeft'
import ChevronRight from '@/components/icons/ChevronRight'
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
}

export default function CarouselClient({
  children,
  className,
  slideClassName,
  translations,
}: CarouselClientProps) {
  const [isInitialized, setIsInitialized] = useState(false)
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
        // Use width of slides to determine how many slides are visible
        slidesPerView="auto"
        // Skip all fully visible slides when navigating
        slidesPerGroupAuto
        onInit={() => {
          setIsInitialized(true)
        }}
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
        'h-11 w-11 items-center justify-center rounded-full bg-white text-blue-500 shadow-lg transition-all',
        'focus:outline-primary-700 hover:scale-110 disabled:opacity-0',
        className
      )}
      ref={ref}
      type="button"
    />
  )
})
