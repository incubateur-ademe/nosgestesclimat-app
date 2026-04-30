import Separator from '@/design-system/layout/Separator'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'
import type { Theme } from '@nosgestesclimat/core/features/actions/types/theme'
import { twMerge } from 'tailwind-merge'
import HighestImpactActionsSection from '../HighestImpactActionsSection'
import ThemeSection from '../ThemeSection'

interface ActionsPageProps extends React.ComponentPropsWithoutRef<'div'> {
  topActions?: Action[]
  themes: Theme[]
  actions: Action[]
}

export default function ActionsPage({
  topActions,
  actions,
  themes,
  className,
  ...props
}: ActionsPageProps) {
  const actionsByTheme = actions.reduce(
    (acc, action) => {
      const themeKey = action.theme.key
      acc[themeKey] ??= []
      acc[themeKey].push(action)
      return acc
    },
    {} as Record<Theme['key'], Action[] | undefined>
  )

  return (
    <div {...props} className={twMerge('pb-24', className)}>
      <div className="mb-10">
        <h1 className="mb-2.5 text-2xl leading-normal md:text-4xl md:leading-13.5">
          Construire mon plan d’action
        </h1>
        <p className="text-base text-slate-500 md:text-lg md:leading-6.75">
          Les actions suivantes vous sont recommandées d’après vos réponses au
          test.
          <br />
          Choisissez-celles qui vous semblent atteignables, l’essentiel, c’est
          de se mettre en mouvement !
        </p>
      </div>

      {topActions && topActions.length > 0 && (
        <>
          <HighestImpactActionsSection actions={topActions} className="mb-10" />
          <Separator variant="full" className="my-10 hidden md:block" />
        </>
      )}

      <div className="relative flex flex-col gap-5 md:gap-10">
        {themes
          .filter((theme) => {
            const actions = actionsByTheme[theme.key]
            return actions && actions.length > 0
          })
          .map((theme) => {
            return (
              <ThemeSection
                key={theme.id}
                theme={theme}
                actions={actionsByTheme[theme.key] ?? []}
              />
            )
          })}
      </div>
    </div>
  )
}
