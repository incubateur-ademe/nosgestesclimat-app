import { TUTORIAL_PATH } from '@/constants/urls/paths'
import {
  baseClassNames,
  getVariantClassNames,
  sizeClassNames,
} from '@/design-system/buttons/buttonStyles'
import { cn } from 'cn'
import LockIcon from '../icons/LockIcon'
import Link from '../Link'
import Trans from '../translation/trans/TransServer'

export default function NoResultsBlock() {
  return (
    <div className="mt-2 mb-16 flex flex-col rounded-lg bg-slate-50 p-8">
      <p className="mb-6 flex items-center justify-center text-lg font-bold">
        <LockIcon className="fill-default mr-4 inline-block h-6 w-6 min-w-6" />
        <Trans i18nKey="mon-espace.noResults.description">
          Passez le test pour débloquer le contenu ici
        </Trans>
      </p>

      <div className="flex justify-center">
        <Link
          href={TUTORIAL_PATH}
          className={cn(
            baseClassNames,
            getVariantClassNames('outlined', 'primary'),
            sizeClassNames.md
          )}>
          <Trans i18nKey="mon-espace.noResults.link.text">
            Je calcule mon empreinte
          </Trans>
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
