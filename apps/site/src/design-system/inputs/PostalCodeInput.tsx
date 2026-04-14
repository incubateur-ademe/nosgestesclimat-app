'use client'

import { useClientTranslation } from '@/hooks/useClientTranslation'
import axios from 'axios'
import { useState } from 'react'
import ComplexSelect from './ComplexSelect'

interface Props {
  postalCode?: string
  setPostalCode: (postalCode: string) => void
}

interface Suggestion {
  value: string
  label: string
}

interface City {
  code: string
  nom: string
  codesPostaux: string[]
}

export default function PostalCodeInput({ postalCode, setPostalCode }: Props) {
  const { t } = useClientTranslation()
  const [searchValue, setSearchValue] = useState('')

  return (
    <ComplexSelect
      className="max-w-[30rem]"
      classNames={{
        control: () =>
          `p-0 border-gray-300 cursor-pointer rounded-full border border-solid bg-gray-100!  text-sm transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-700 focus:ring-offset-3`,

        valueContainer: () => `p-4! cursor-pointer`,
        input: () => `p-0! m-0! border-none`,
        option: () => 'cursor-pointer!',
      }}
      isAsync
      isSearchable
      cacheOptions
      value={
        postalCode
          ? {
              // @ts-expect-error fix me
              value: postalCode,
              label: postalCode,
            }
          : undefined
      }
      styles={{
        menu: (baseStyles: { display?: string; cursor?: string }) => ({
          ...baseStyles,
          cursor: 'pointer',
          display: searchValue ? 'block' : 'none',
        }),
      }}
      placeholder={t('Veuillez entrer votre code postal')}
      // @ts-expect-error fix me
      onChange={(choice: Suggestion | null) =>
        setPostalCode(choice?.value || '')
      }
      loadOptions={(search: string) => {
        if (search.length < 2) {
          return Promise.resolve([])
        }

        setSearchValue(search)

        return axios
          .get(
            `https://geo.api.gouv.fr/departements/${
              // Outre-mer departments have 3 numbers
              search.length === 3 ? search : search.substring(0, 2)
            }/communes?fields=code,nom,codesPostaux`
          )
          .then((res) =>
            res.data.reduce(
              (suggestionsAccumulator: Suggestion[], city: City) => {
                // Filter postal codes that start with the search string (some cities have multiple postal codes)
                const filteredPostalCodes = city.codesPostaux.filter(
                  (cp: string) => cp?.startsWith(search)
                )
                return [
                  ...suggestionsAccumulator,
                  ...filteredPostalCodes.map((cp: string) => ({
                    value: cp,
                    label: `${cp} - ${city.nom}`,
                  })),
                ]
              },
              []
            )
          )
      }}
      components={{
        NoOptionsMessage: () => (
          <span className="p-1 pl-2 text-xs text-gray-700">
            Oups, nous n'avons pas trouvé de correspondances
          </span>
        ),
      }}
    />
  )
}
