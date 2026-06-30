'use client'

import BlockSkeleton from '@/design-system/layout/BlockSkeleton'
import { useFormState } from '@/publicodes-state'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import Logo from '../misc/Logo'
import TotalFootprintNumber from '../misc/TotalFootprintNumber'
import Category from './topBar/Category'
import Progress from './topBar/Progress'
import TotalButtons from './topBar/TotalButtons'

export default function TopBar({
  toggleQuestionList,
  simulationMode = true,
  showTotal = false,
  className,
}: {
  toggleQuestionList?: () => void
  simulationMode?: boolean
  showTotal?: boolean
  className?: string
}) {
  const { currentCategory } = useFormState()

  return (
    <header
      className={twMerge(
        'sticky top-0 z-50 h-16 w-full bg-white',
        !simulationMode && 'static z-0 bg-white',
        className
      )}>
      <div
        className={twMerge(
          'relative flex h-full items-center gap-4 overflow-visible pt-2 pb-3 lg:pt-4 lg:pb-5',
          !simulationMode && 'border-primary-100 border-b'
        )}>
        {simulationMode && <Progress />}

        <div className="mb-0 flex w-full max-w-5xl justify-between overflow-visible pr-4 pl-1 lg:mx-auto lg:px-4">
          <div className="flex items-center gap-1 md:gap-4">
            <Link href="/" className="mr-2 md:mr-0">
              <Logo size="sm" />
            </Link>

            <div className="flex border-l border-slate-300 pl-2 md:pl-4">
              {showTotal ? (
                <TotalFootprintNumber
                  size="lg"
                  className="flex-row items-baseline bg-white md:gap-1"
                />
              ) : currentCategory ? (
                <Category category={currentCategory} />
              ) : (
                <BlockSkeleton className="h-12 w-40 pt-4" />
              )}
            </div>
          </div>
          {toggleQuestionList ? (
            <TotalButtons toggleQuestionList={toggleQuestionList} />
          ) : null}
        </div>
      </div>
    </header>
  )
}
