import type { ReactElement } from 'react'
import type { AccordionItemType } from './accordion/AccordionItem'

export default function Accordion({
  className = '',
  children,
}: {
  children?: ReactElement<AccordionItemType> | ReactElement<AccordionItemType>[]
  className?: string
}) {
  return (
    <ul className={className} role="list">
      {children}
    </ul>
  )
}
