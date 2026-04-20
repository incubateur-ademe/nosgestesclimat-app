import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { DefaultPageProps } from '@/types'

export const generateMetadata = getCommonMetadata<
  DefaultPageProps<{ params: { orgaSlug: string } }>
>({
  title: 'Mon espace organisation - Nos Gestes Climat',
  description:
    'Accédez à des services sur mesure pour sensibiliser vos partenaires au sein de votre organisation.',
  alternates: ({ orgaSlug }) => ({
    canonical: `/organisations/${orgaSlug}`,
  }),
})

/* global LayoutProps */
export default function Layout({
  children,
}: LayoutProps<'/[locale]/organisations/[orgaSlug]'>) {
  return <>{children}</>
}
