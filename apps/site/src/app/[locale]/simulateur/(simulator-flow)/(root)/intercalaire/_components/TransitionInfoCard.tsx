import Trans from '@/components/translation/trans/TransServer'
import { twMerge } from 'tailwind-merge'
import CurvedArrowSvg from './transitionInfoCard/CurvedArrowSvg'
import FunFactCard from './transitionInfoCard/FunFactCard'

interface Props {
  className: string
  title: React.ReactNode
  locale: string
  funFactContent: React.ReactNode
  rightContent: React.ReactNode
}

export default function TransitionInfoCard({
  className,
  title,
  locale,
  funFactContent,
  rightContent,
}: Props) {
  return (
    <div
      className={twMerge(
        'mt-6 w-full rounded-2xl border-2 border-slate-200 p-6 shadow-sm md:mt-8',
        className
      )}>
      <h2 className="text-primary-600 text-center text-xl">{title}</h2>

      <div className="flex flex-col md:flex-row">
        <div className="mt-6 flex flex-1 flex-col items-center md:mt-12">
          <FunFactCard>{funFactContent}</FunFactCard>

          <div className="relative w-80 max-w-full md:ml-16">
            <p className="text-primary-600 mt-10 mb-8 text-center md:mt-16 md:text-left">
              <Trans locale={locale}>
                Ce graphique te permet de mieux comprendre les différents
                impacts
              </Trans>
            </p>
            <CurvedArrowSvg className="absolute right-1/2 -bottom-6 w-20 translate-x-1/2 rotate-180 md:right-0 md:-bottom-4 md:w-auto md:translate-x-0 md:rotate-0" />
          </div>
        </div>

        <div className="flex-1">{rightContent}</div>
      </div>
    </div>
  )
}
