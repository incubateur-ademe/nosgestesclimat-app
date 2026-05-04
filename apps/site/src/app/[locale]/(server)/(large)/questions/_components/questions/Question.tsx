'use client'

import { useRule } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  question: DottedName
}

export default function Question({ question }: Props) {
  const { label, type, choices } = useRule(question)
  return (
    <li>
      <strong>- {question}</strong>
      <div>question: {label} </div>
      <div>type: {type} </div>
      {choices && (
        <ul>
          {Object.entries(choices).map(([key, value]) => (
            <li key={key}>- {value}</li>
          ))}
        </ul>
      )}
    </li>
  )
}
