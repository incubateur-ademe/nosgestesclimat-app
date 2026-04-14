import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import MosaicQuestion from './mosaic/MosaicQuestion'
import MosaicBooleanInput from './mosaic/mosaicQuestion/MosaicBooleanInput'
import { useMosaicState } from './mosaic/useMosaicState'

interface Props {
  question: DottedName
  questionsOfMosaic: DottedName[]
  firstInputId: string
  label: string
}

export default function Mosaic({
  question,
  questionsOfMosaic,
  firstInputId,
  label,
}: Props) {
  const { values, setValue, aucunOption } = useMosaicState({
    questionsOfMosaic,
    question,
  })

  const { t } = useClientTranslation()

  return (
    <>
      <fieldset
        className={`grid w-[90%] auto-rows-fr items-stretch gap-2 md:w-full ${questionsOfMosaic.length <= 2 ? 'md:max-w-128 md:grid-cols-1' : 'md:grid-cols-2'} md:gap-4`}>
        <legend className="sr-only">{label}</legend>
        {questionsOfMosaic.map((questionOfMosaic, index) => (
          <MosaicQuestion
            key={questionOfMosaic}
            parentMosaic={question}
            question={questionOfMosaic}
            index={index}
            firstInputId={firstInputId}
            value={values[questionOfMosaic]}
            setValue={setValue}
          />
        ))}
        {aucunOption && (
          <MosaicBooleanInput
            question={`${question} . aucun` as DottedName}
            title={
              aucunOption.label === 'non concerné'
                ? t(
                    'simulator.mosaic.notConcerned',
                    'Je ne suis pas concerné·e'
                  )
                : t('simulator.mosaic.noneOfTheseOptions', 'Aucun')
            }
            icons="❌"
            value={aucunOption.value}
            setValue={aucunOption.setValue}
            index={questionsOfMosaic.length}
          />
        )}
      </fieldset>
    </>
  )
}
