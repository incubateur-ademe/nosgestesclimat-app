'use client'

import { Children, forwardRef, useRef } from 'react'
import { A11y, Keyboard, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import ChevronLeft from '@/components/icons/ChevronLeft'
import ChevronRight from '@/components/icons/ChevronRight'
import { twMerge } from 'tailwind-merge'
import './ActionsCarousel.css'

type ActionsCarouselProps = Pick<
  React.ComponentPropsWithoutRef<'div'>,
  'children' | 'className'
>

export default function ActionsCarousel({
  className,
  children,
  ...rest
}: ActionsCarouselProps) {
  const prevButton = useRef(null)
  const nextButton = useRef(null)

  return (
    <div {...rest} className={twMerge('relative', className)}>
      <NavigationButton
        ref={prevButton}
        className="left-2.5 md:-left-2.5 md:-translate-x-1/2 xl:-left-5">
        <ChevronLeft />
      </NavigationButton>
      <NavigationButton
        ref={nextButton}
        className="right-2.5 md:-right-2.5 md:translate-x-1/2 xl:-right-5">
        <ChevronRight />
      </NavigationButton>
      <Swiper
        className="px-2.5 md:px-0"
        modules={[Navigation, Keyboard, A11y]}
        navigation={{
          addIcons: false,
        }}
        keyboard={{
          enabled: true,
        }}
        a11y={
          {
            // TODO: i18n messages
          }
        }
        spaceBetween={10}
        // Use width of slides to determine how many slides are visible
        slidesPerView="auto"
        // Skip all fully visible slides when navigating
        slidesPerGroupAuto
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
            <SwiperSlide className="w-3/4 max-w-55 sm:w-62 sm:max-w-none">
              {child}
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
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
        'h-11 w-11 items-center justify-center rounded-full bg-white text-blue-500 shadow-[0_4px_4px_rgba(26,26,26,0.25)] transition-all',
        'focus:outline-primary-700 hover:scale-110 disabled:opacity-0',
        className
      )}
      ref={ref}
      type="button"
    />
  )
})
