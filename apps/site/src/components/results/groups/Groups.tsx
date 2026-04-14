import NewItemCardLink from '@/components/cta/NewItemCardLink'
import PlusIcon from '@/components/icons/PlusIcon'
import Trans from '@/components/translation/trans/TransClient'
import {
  baseClassNames,
  colorClassNames,
  sizeClassNames,
} from '@/design-system/buttons/Button'
import Title from '@/design-system/layout/Title'
import type { Group } from '@/types/groups'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import GroupContent from './groups/GroupContent'

interface Props {
  groups: Group[]
}

export default function Groups({ groups }: Props) {
  return (
    <>
      <Title
        tag="h2"
        title={
          <Trans i18nKey="mon-espace.groups.title">
            Mes tests collectifs "Amis" et "Famille"
          </Trans>
        }
      />
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1">
          <GroupContent groups={groups} />
        </div>

        {groups.length > 0 && (
          <>
            {/* Desktop */}
            <NewItemCardLink
              href="/amis/creer/votre-groupe"
              className="hidden md:block"
              data-testid="create-group-button"
              label={
                <Trans i18nKey="mon-espace.groups.create">
                  Créer un groupe
                </Trans>
              }
              color="secondary"
              imageAlt=""
              imageSrc="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_people_raising_arm_fe915601cd.png"
              icon={<PlusIcon className="stroke-primary-700 min-w-8" />}
              ctaClassName="min-w-64"
            />

            {/* Mobile */}
            <Link
              href="/amis/creer"
              className={twMerge(
                'block md:hidden',
                baseClassNames,
                sizeClassNames.md,
                colorClassNames.secondary
              )}>
              <PlusIcon className="stroke-primary-700 min-w-8" />
              <Trans i18nKey="mon-espace.groups.create">Créer un groupe</Trans>
            </Link>
          </>
        )}
      </div>
    </>
  )
}
