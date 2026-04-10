import Breadcrumbs from '@/design-system/layout/Breadcrumbs'
import type {
  Organisation,
  OrganisationPoll,
  PublicOrganisationPoll,
} from '@/types/organisations'
import type { TFunction } from 'i18next'
import type { ComponentProps } from 'react'

type Item = ComponentProps<typeof Breadcrumbs>['items'][number]
export default function OrganisationFilAriane({
  className,
  organisation,
  isAdmin,
  poll,
  currentPage,
  t,
}: {
  className?: string
  organisation?: Organisation
  isAdmin?: boolean
  poll?: OrganisationPoll | PublicOrganisationPoll
  currentPage?: Item
  t: TFunction
}) {
  const items: Item[] = [
    {
      href: '/',
      label: t('Accueil'),
    },
    {
      href: '/organisations',
      label: t('Organisations'),
    },
  ]

  if (organisation) {
    const organisationHref = `/organisations/${organisation.slug}`
    items.push({
      label: organisation.name,
      href: organisationHref,
      isDisabled: !isAdmin,
    })
  }

  if (poll) {
    const pollHref = `/organisations/${organisation?.slug}/campagnes/${poll.slug}`
    items.push({
      label: poll.name,
      href: pollHref,
    })
  }
  if (currentPage) {
    items.push(currentPage)
  }
  items.at(-1)!.isActive = true

  return <Breadcrumbs className={className} items={items} />
}
