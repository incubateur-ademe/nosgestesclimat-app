import type { CSSProperties, ReactNode } from 'react'

interface Props {
  index: number
  children: ReactNode
}

export default function AnimatedAccordionItem({ index, children }: Props) {
  return (
    <div
      className="animate-slide-in-from-bottom opacity-0 motion-reduce:translate-y-0 motion-reduce:animate-none motion-reduce:opacity-100"
      style={
        {
          animationDelay: `${index * 0.1}s`,
          animationFillMode: 'forwards',
        } as CSSProperties
      }>
      {children}
    </div>
  )
}
