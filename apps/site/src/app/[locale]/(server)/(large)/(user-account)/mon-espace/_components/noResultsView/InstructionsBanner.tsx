import DownArrow from '@/components/icons/DownArrow'
import Trans from '@/components/translation/trans/TransServer'
import { clickMySpaceNoResultsStartTest } from '@/constants/tracking/pages/mon-espace'
import { captureClickMySpaceNoResultsStartTest } from '@/constants/tracking/posthogTrackers'
import { TUTORIAL_PATH } from '@/constants/urls/paths'
import {
  baseClassNames,
  colorClassNames,
  sizeClassNames,
} from '@/design-system/buttons/Button'
import Separator from '@/design-system/layout/Separator'
import Emoji from '@/design-system/utils/Emoji'
import type { Locale } from '@/i18nConfig'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

export default function InstructionsBanner({ locale }: { locale: Locale }) {
  return (
    <div className="relative mb-10 rounded-lg bg-blue-50 p-4 md:p-6">
      <article className="relative flex flex-col">
        <div>
          <div>
            <h1 className="mb-4">
              {' '}
              <span className="inline-block text-xl md:text-2xl">
                <Trans i18nKey="mon-espace.welcome.title" locale={locale}>
                  Bienvenue dans votre espace Nos Gestes Climat !
                </Trans>
                <Emoji>👋</Emoji>
              </span>
            </h1>
            <Separator className="mt-0 mb-6" />
          </div>
        </div>

        <p className="mb-4 md:mb-6">
          <Trans
            locale={locale}
            i18nKey="mon-espace.instructions.description.part1">
            Avant toute chose, nous vous invitons à
          </Trans>{' '}
          <strong>
            <Trans
              i18nKey="mon-espace.instructions.description.part2"
              locale={locale}>
              passer le test
            </Trans>
          </strong>{' '}
          <Trans
            locale={locale}
            i18nKey="mon-espace.instructions.description.part3">
            pour :
          </Trans>
        </p>
        <ul className="mb-6 flex flex-col gap-3 md:gap-6">
          <li className="flex items-center gap-4">
            <DownArrow className="fill-default h-6 w-6 min-w-6 -rotate-90" />
            <p className="mb-0">
              <Trans
                locale={locale}
                i18nKey="mon-espace.instructions.list.item1.part1">
                Retrouver ici
              </Trans>{' '}
              <strong>
                <Trans
                  locale={locale}
                  i18nKey="mon-espace.instructions.list.item1.part2">
                  vos résultats d'empreinte
                </Trans>
              </strong>
            </p>
          </li>
          <li className="flex items-center gap-4">
            <DownArrow className="fill-default h-6 w-6 min-w-6 -rotate-90" />
            <p className="mb-0">
              <Trans
                locale={locale}
                i18nKey="mon-espace.instructions.list.item2.part1">
                Découvrir
              </Trans>{' '}
              <strong>
                <Trans
                  locale={locale}
                  i18nKey="mon-espace.instructions.list.item2.part2">
                  vos actions climat personnalisées
                </Trans>
              </strong>{' '}
              <Trans
                locale={locale}
                i18nKey="mon-espace.instructions.list.item2.part3">
                et
              </Trans>{' '}
              <strong>
                <Trans
                  locale={locale}
                  i18nKey="mon-espace.instructions.list.item2.part4">
                  suivre vos progrès
                </Trans>
              </strong>
            </p>
          </li>

          <li className="flex items-center gap-4">
            <DownArrow className="fill-default h-6 w-6 min-w-6 -rotate-90" />
            <p className="mb-0">
              <strong>
                <Trans
                  locale={locale}
                  i18nKey="mon-espace.instructions.list.item3.part1">
                  Lancer
                </Trans>{' '}
              </strong>
              <Trans
                locale={locale}
                i18nKey="mon-espace.instructions.list.item3.part2">
                et
              </Trans>{' '}
              <strong>
                <Trans
                  locale={locale}
                  i18nKey="mon-espace.instructions.list.item3.part3">
                  retrouver vos tests collectifs
                </Trans>
              </strong>{' '}
              <Trans
                locale={locale}
                i18nKey="mon-espace.instructions.list.item3.part4">
                (organisations, famille, amis...)
              </Trans>
            </p>
          </li>
        </ul>

        <div>
          <Link
            href={TUTORIAL_PATH}
            className={twMerge(
              baseClassNames,
              colorClassNames.primary,
              sizeClassNames.md
            )}
            scroll={false}
            data-track-event={clickMySpaceNoResultsStartTest}
            data-track-posthog={captureClickMySpaceNoResultsStartTest}>
            <Trans locale={locale} i18nKey="mon-espace.instructions.link.text">
              Passer le test
            </Trans>
          </Link>
        </div>
      </article>
    </div>
  )
}
