'use client'

import { Children, cloneElement, isValidElement } from 'react'
import type { ActionCardWithTempProps } from './ActionCard'
import { useActionContext, type ActionContext } from './contexts/action'

interface Props {
  children: React.ReactElement<ActionCardWithTempProps>
  propsToInject: (keyof ActionContext)[]
}

export default function ActionContextWrapper({
  children,
  propsToInject,
}: Props) {
  const actionContextValues = useActionContext()

  return Children.map(children, (child) => {
    if (isValidElement(child)) {
      const propsInjectedObject = propsToInject.reduce((acc, propKey) => {
        return {
          ...acc,
          [propKey]: actionContextValues[propKey],
        }
      }, {})

      return cloneElement(child, propsInjectedObject)
    }
    return child
  })
}
