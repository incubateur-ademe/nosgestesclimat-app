import PasserTestBanner from '@/components/layout/PasserTestBanner'
import { DOCUMENTATION_PATH } from '@/constants/urls/paths'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import { getRules } from '@/helpers/modelFetching/getRules'
import { getRuleTitle } from '@/helpers/publicodes/getRuleTitle'
import { getUser } from '@/helpers/server/dal/user'
import { getCurrentSimulation } from '@/helpers/server/model/simulations'
import type { DefaultPageProps } from '@/types'
import { capitalizeString } from '@/utils/capitalizeString'
import { decodeRuleNameFromPath } from '@/utils/decodeRuleNameFromPath'
import { redirect } from 'next/navigation'
import DocumentationRouter from './_components/DocumentationRouter'
import DocumentationServer from './_components/documentationRouter/DocumentationServer'

export async function generateMetadata({
  params,
}: DefaultPageProps<{
  params: { slug: string[] }
}>) {
  const { locale, slug } = await params
  const { t } = await getServerTranslation({ locale })

  const rules = await getRules({
    isOptim: false,
    locale,
  })

  const ruleName = decodeRuleNameFromPath(slug.join('/'))

  const rule = rules[ruleName]

  return getMetadataObject({
    locale,
    title: rule
      ? // Dynamic title for each documentation page
        t('Documentation, de la règle : {{ruleTitle}} - Nos Gestes Climat', {
          ruleTitle: capitalizeString(
            getRuleTitle({ ...rule, dottedName: ruleName })
          ),
        })
      : // Fallback title
        t('Documentation, règle du calculateur - Nos Gestes Climat'),
    description: t(
      'Notre documentation détaille les calculs qui nous ont permis de calculer votre bilan carbone personnel.'
    ),
    alternates: {
      canonical: `/documentation/${slug.join('/')}`,
    },
  })
}

// The page content is in layout.tsx in order to persist the state
// between the server and the client
export default async function DocumentationPage({
  params,
}: DefaultPageProps<{
  params: { slug: string[] }
}>) {
  const { locale, slug } = await params
  const user = await getUser()
  const currentSimulation = await getCurrentSimulation({ user })

  const rules = await getCachedRules({
    modelStr: currentSimulation?.model,
    locale,
    isOptim: false,
  })

  const ruleName = decodeRuleNameFromPath(slug.join('/'))

  if (!(ruleName in rules)) {
    redirect(DOCUMENTATION_PATH)
  }

  return (
    <div className="mt-4 mb-16 w-full px-2">
      <PasserTestBanner locale={locale} />
      <DocumentationRouter
        rules={rules}
        currentSimulation={currentSimulation}
        slug={slug}
        serverComponent={
          <DocumentationServer
            locale={locale}
            ruleName={ruleName}
            rule={rules[ruleName]!}
            rules={rules}
          />
        }
      />
    </div>
  )
}
