'use client'
import { carboneMetric, eauMetric } from '@/constants/model/metric'
import Emoji from '@/design-system/utils/Emoji'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Metrics } from '@incubateur-ademe/nosgestesclimat'
import type { Options, SingleValueProps, StylesConfig } from 'react-select'
import Select, { components } from 'react-select'
import Trans from '../translation/trans/TransClient'

interface OptionType {
  value: string
  label: string
  icon: string
}

export default function FootprintSelector({
  footprintSelected,
  onChange,
}: {
  footprintSelected: Metrics
  onChange: (footprint: Metrics) => void
}) {
  const { t } = useClientTranslation()

  const options: Options<OptionType> = [
    { value: carboneMetric, label: t('Carbone'), icon: '🌡️' },
    { value: eauMetric, label: t('Eau'), icon: '💧' },
  ]

  const customStyles: StylesConfig<OptionType, false> = {
    control: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      borderWidth: '2px',
      borderColor: '#4949ba',
      // backgroundColor: '#e3ebfc',
      minWidth: '7rem',
      paddingTop: '0',
      paddingBottom: '0',
      color: '#373978',
      cursor: 'pointer',
      fontSize: '0.875rem',
      '&:hover': { borderColor: '#3d3f96', backgroundColor: '#e3ebfc' },
      transition: 'all 0.2s ease-in-out',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    indicatorsContainer: (provided) => ({
      ...provided,
      margin: '-0.2rem',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#3d3f96',
      '&:hover': { color: '#3d3f96' },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#3d3f96',
      fontWeight: 'bold',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0',
      paddingLeft: '0.5rem',
    }),
    option: (provided, state) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      backgroundColor: state.isSelected ? '#737de1' : provided.backgroundColor,
      color: state.isSelected ? 'white' : provided.color,
    }),
    menu: (provided) => ({ ...provided, borderRadius: '0.5rem' }),
  }

  const customComponents = {
    SingleValue: ({
      children,
      ...props
    }: SingleValueProps<OptionType, false>) => (
      <components.SingleValue {...props}>
        <div className="flex flex-col">
          <div
            id="footprint-select-label"
            className="text-default -mb-1 cursor-pointer text-[0.6rem] font-normal select-none">
            <Trans>Empreinte</Trans>
          </div>

          <div className="flex items-center">{children}</div>
        </div>
      </components.SingleValue>
    ),
  }

  return (
    <div className="relative rounded-lg">
      <div className="relative block h-full">
        <Select
          aria-labelledby="footprint-select-label"
          inputId="footprint-select-input"
          options={options}
          isClearable={false}
          isSearchable={false}
          value={options.find((option) => option.value === footprintSelected)}
          onChange={(selected) => onChange((selected?.value as Metrics) || '')}
          styles={customStyles}
          components={customComponents}
          formatOptionLabel={({ label, icon }) => (
            <div className="flex items-center">
              {label} <Emoji>{icon}</Emoji>
            </div>
          )}
        />
      </div>
    </div>
  )
}
