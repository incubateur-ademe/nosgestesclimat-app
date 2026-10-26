import { TUTORIAL_PATH } from '@/constants/urls/paths'
import {
  baseClassNames,
  getVariantClassNames,
  sizeClassNames,
} from '@/design-system/buttons/buttonStyles'
import { cn } from 'cn'
import type { ReactNode } from 'react'
import LockIcon from '../icons/LockIcon'
import Link from '../Link'
import Trans from '../translation/trans/TransServer'

interface Props {
  title?: ReactNode
  link?: {
    href: string
    label: ReactNode
  }
}

export default function NoResultsBlock({ title, link }: Props) {
  return (
    <div className="mt-2 mb-16 flex flex-col rounded-lg bg-slate-50 p-8">
      <p className="mb-6 flex items-center justify-center text-lg font-bold">
        <LockIcon className="fill-default mr-4 inline-block h-6 w-6 min-w-6" />
        {title ?? (
          <Trans i18nKey="mon-espace.noResults.description">
            Passez le test pour débloquer le contenu ici
          </Trans>
        )}
      </p>

      <div className="flex justify-center">
        <Link
          href={link?.href ?? TUTORIAL_PATH}
          className={cn(
            baseClassNames,
            getVariantClassNames('outlined', 'primary'),
            sizeClassNames.md
          )}>
          {link?.label ?? (
            <Trans i18nKey="mon-espace.noResults.link.text">
              Je calcule mon empreinte
            </Trans>
          )}
        </Link>
      </div>

      <div className="flex justify-center">
        <img
          src="/_static/cms/engagement_collectif_pour_le_climat_4f8f1edfc1.svg"
          alt=""
          width={340}
          className="grayscale"
        />
      </div>
    </div>
  )
}
