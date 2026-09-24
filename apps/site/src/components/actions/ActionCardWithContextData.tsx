'use client'

import type { ActionCardWithTempProps } from './ActionCard'
import ActionCard from './ActionCard'
import { useActionContext } from './contexts/action'

export type ActionCardWithContextDataProps = Omit<
  ActionCardWithTempProps,
  'from' | 'locale' | 'assessmentStatus'
>

export default function ActionCardWithContextData(
  props: ActionCardWithContextDataProps
) {
  const { from, locale, assessmentStatus, shouldHideActionCommitFeature } =
    useActionContext()
  return (
    <ActionCard
      {...props}
      from={from}
      locale={locale}
      assessmentStatus={assessmentStatus}
      shouldHideActionCommitFeature={shouldHideActionCommitFeature}
    />
  )
}
