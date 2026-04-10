'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

import { useLocale } from '@/hooks/useLocale'
import budgetFr from '../_data/budget.yaml'
import budgetEn from '../_data/budgetEn.yaml'
import RessourcesAllocationTable from './RessourcesAllocationTable'

type BudgetType = Record<
  string,
  Record<
    string,
    {
      description: ReactNode
    }
  >
>

export default function SelectYear() {
  const locale = useLocale()
  const budget = locale === 'fr' ? budgetFr : budgetEn

  const years = Object.keys(budget as unknown as BudgetType)
  const [selectedYear, setSelectedYear] = useState<string>(
    years[years.length - 1]
  )

  const products = Object.keys(
    (budget as unknown as BudgetType)[selectedYear]
  ).filter((elt) => elt !== 'description')
  const categories = [
    ...new Set(
      products
        .map((q) =>
          Object.keys(
            (budget as unknown as BudgetType)[selectedYear]?.[q] ?? {}
          )
        )
        .reduce((acc, curr) => [...acc, ...curr], [])
    ),
  ]

  return (
    <>
      <div className="mb-4 inline-flex items-center">
        <b>Année :</b>
        <select
          className="focus:ring-primary-700 mb-0 ml-4 w-[10rem] focus:ring-2 focus:ring-offset-3 focus:outline-hidden"
          name="année"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value)
          }}>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <p>
        {String(
          (budget as unknown as BudgetType)[selectedYear]?.description ?? ''
        )}
      </p>
      <RessourcesAllocationTable
        selectedYear={selectedYear}
        budget={
          budget as unknown as Record<
            string,
            Record<string, Record<string, number>>
          >
        }
        products={products}
        categories={categories}
      />
    </>
  )
}
