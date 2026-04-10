import Separator from '@/design-system/layout/Separator'
import type { Locale } from '@/i18nConfig'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import PlusIcon from '../icons/PlusIcon'
import Trans from '../translation/trans/TransServer'
import Background from './Background'

export default function FAQ({
  subTitle,
  questions,
  isBackgroundSkewed = true,
  className,
  shouldUseDangerouslySetInnerHTML = false,
  locale,
}: {
  className?: string
  subTitle?: ReactNode
  questions: {
    question: ReactNode | string
    answer: ReactNode
  }[]
  isBackgroundSkewed?: boolean
  shouldUseDangerouslySetInnerHTML?: boolean
  locale: Locale
}) {
  return (
    <div
      className={twMerge(
        'relative w-full bg-[#F6F6F5] py-16 md:px-4 md:py-20 lg:px-0',
        className
      )}>
      {isBackgroundSkewed && (
        <Background
          direction="right"
          className="top-auto -bottom-10 mt-6 h-[200px] bg-[#F6F6F5] sm:-bottom-16"
          withColorLine
        />
      )}

      <div className="relative mx-auto flex w-full max-w-full flex-col gap-8 px-4 md:max-w-5xl md:flex-row md:gap-16 md:px-0">
        <div className="flex flex-col gap-4 pl-4 md:w-[240px] md:max-w-[240px] md:pl-0 md:text-left">
          <h2 className="mb-0 text-2xl md:text-3xl">
            <Trans locale={locale}>FAQ</Trans>
          </h2>
          <Separator className="my-0" />
          <p className="text-sm font-bold md:text-xl">{subTitle}</p>
        </div>

        <ul className="flex flex-1 list-none flex-col gap-4">
          {questions.map(({ question, answer }, index) => (
            <li key={`question-${index}`}>
              <details className="group rounded-lg bg-white px-4 py-4 transition-all duration-200">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden [&::marker]:hidden">
                  <h3 className="mb-0 text-[13px] font-bold md:text-base">
                    {question}
                  </h3>

                  <PlusIcon className="stroke-primary-700 inline-block h-4 w-4 min-w-4 origin-center transform transition-transform duration-300 group-open:rotate-45" />
                  <span className="sr-only">
                    <Trans locale={locale}>
                      Cliquez pour afficher la réponse
                    </Trans>
                  </span>
                </summary>

                <div className="grid grid-rows-[0fr] transition-all duration-200 ease-in-out group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    {shouldUseDangerouslySetInnerHTML ? (
                      <div
                        className="markdown pt-4 text-sm last:mb-0 md:text-base"
                        dangerouslySetInnerHTML={{
                          __html: answer as string,
                        }}
                      />
                    ) : (
                      <div className="pt-4 text-sm last:mb-0 md:text-base">
                        {answer}
                      </div>
                    )}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
