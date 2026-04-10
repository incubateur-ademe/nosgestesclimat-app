'use client'

import { FILTER_SEARCH_PARAM_KEY } from '@/constants/filtering'
import { encodeDottedNameAsURI } from '@/utils/format/encodeDottedNameAsURI'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import CategoryFilter from './categoryFilters/CategoryFilter'

interface Props {
  categories: {
    title: string
    dottedName: DottedName
    count: number
  }[]
  className?: string
  children: React.ReactNode
}

export default function CategoryTabs({
  categories,
  className,
  children,
}: Props) {
  const tablistRef = useRef<HTMLDivElement>(null)

  const searchParams = useSearchParams()

  const categorySelected = searchParams.get(FILTER_SEARCH_PARAM_KEY) || ''

  // Find the active tab index based on the selected category
  const getActiveTabIndex = useCallback(() => {
    if (!categorySelected) return 0
    return categories.findIndex(
      (cat) => encodeDottedNameAsURI(cat.dottedName) === categorySelected
    )
  }, [categorySelected, categories])

  const [activeTabIndex, setActiveTabIndex] =
    useState<number>(getActiveTabIndex())

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTabIndex(getActiveTabIndex())
  }, [categorySelected, categories, getActiveTabIndex])

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!tablistRef.current) return

    const tabs = tablistRef.current.querySelectorAll('[role="tab"]')
    const tabCount = tabs.length

    let newIndex = activeTabIndex

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        newIndex = activeTabIndex > 0 ? activeTabIndex - 1 : tabCount - 1
        break
      case 'ArrowRight':
        event.preventDefault()
        newIndex = activeTabIndex < tabCount - 1 ? activeTabIndex + 1 : 0
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = tabCount - 1
        break
      default:
        return
    }

    setActiveTabIndex(newIndex)
    ;(tabs[newIndex] as HTMLElement).focus()
  }

  return (
    <div className="w-full">
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Filtres par catégorie"
        tabIndex={-1}
        className={twMerge(
          'mb-4 flex flex-wrap justify-start gap-2',
          className
        )}
        onKeyDown={handleKeyDown}>
        {categories?.map(({ title, dottedName, count }, index) => {
          return (
            <CategoryFilter
              key={title}
              title={title}
              dottedName={dottedName}
              count={count}
              index={index}
              isActive={index === activeTabIndex}
              categorySelected={categorySelected}
              onTabActivate={() => setActiveTabIndex(index)}
            />
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`category-panel-${activeTabIndex}`}
        aria-labelledby={`category-tab-${activeTabIndex}`}
        className="w-full">
        {children}
      </div>
    </div>
  )
}
