import Switch from '@/design-system/inputs/Switch'
import { useClientTranslation } from '@/hooks/useClientTranslation'

interface Props {
  currentUnit: string
  defaultUnit: string
  assistanceUnit: string
  updateCurrentUnit: (unit: string) => void
}

export default function AssistanceSwitch({
  currentUnit,
  defaultUnit,
  assistanceUnit,
  updateCurrentUnit,
}: Props) {
  const { t } = useClientTranslation()

  return (
    <div className="mt-4 flex justify-start">
      <Switch
        className="mb-2 w-36"
        aria-label={t(
          'simulator.assistanceSwitch.ariaLabel',
          'Sélectionner le mode de saisie, {{currentUnit}} sélectionné',
          {
            currentUnit,
          }
        )}
        options={[
          {
            label: assistanceUnit,
            isSelected: currentUnit === assistanceUnit,
            'data-testid': 'switch-assistance-unit',
            onClick: () => {
              if (currentUnit !== assistanceUnit)
                updateCurrentUnit(assistanceUnit)
            },
          },
          {
            label: defaultUnit,
            isSelected: currentUnit === defaultUnit,
            'data-testid': 'switch-main-unit',
            onClick: () => {
              if (currentUnit !== defaultUnit) updateCurrentUnit(defaultUnit)
            },
          },
        ]}
      />
    </div>
  )
}
