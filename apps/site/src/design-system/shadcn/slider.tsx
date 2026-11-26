import { cn } from 'cn'
import { Slider as SliderPrimitive } from 'radix-ui'
import * as React from 'react'

const DEFAULT_MIN = 0
const DEFAULT_MAX = 100

function Slider({
  className,
  defaultValue,
  value,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  thumbProps,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  thumbProps?: React.ComponentProps<typeof SliderPrimitive.Thumb> & {
    'data-testid'?: string
  }
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none',
        'data-disabled:opacity-50 data-vertical:h-full',
        'data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col',
        className
      )}
      {...props}>
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          'bg-primary-200 border-primary-700 relative grow overflow-hidden rounded-full border',
          'data-horizontal:h-4 data-horizontal:w-full data-vertical:h-full data-vertical:w-3'
        )}>
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            'bg-primary-700 absolute select-none',
            'data-horizontal:h-full data-vertical:w-full'
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          {...thumbProps}
          className={cn(
            'border-primary-700 relative block size-8 cursor-pointer',
            'shrink-0 rounded-full border-[3px] bg-white transition-transform select-none',
            'ring-primary-200 after:absolute after:-inset-2 hover:scale-115 hover:shadow-md',
            'focus-visible:ring-2 focus-visible:outline-hidden active:ring-2',
            'disabled:pointer-events-none disabled:opacity-50'
          )}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
