import type { Locale } from '@/i18nConfig'
import { FormProvider } from '@/publicodes-state'
import type { Simulation } from '@/publicodes-state/types'
import NoResultsBlock from '../dashboard/NoResultsBlock'
import TopBar from '../simulation/TopBar'
import ActionAutoSave from './actions/ActionAutoSave'
import ActionsContent from './actions/ActionsContent'
import ActionsTutorial from './actions/ActionsTutorial'

interface Props {
  simulations: Simulation[]
  locale: Locale
}
export function ActionPage({ simulations, locale }: Props) {
  return (
    <div className="mb-20 flex flex-col">
      {simulations.length <= 0 ? (
        <NoResultsBlock locale={locale} />
      ) : (
        <FormProvider>
          <ActionAutoSave />

          <TopBar className="mb-6" simulationMode={false} showTotal />

          <ActionsTutorial />

          <ActionsContent />
        </FormProvider>
      )}
    </div>
  )
}
