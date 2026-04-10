import Ademe from '@/components/images/partners/Ademe'
import Marianne from '@/components/images/partners/Marianne'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import Image from 'next/image'

export default async function Partners({ locale }: { locale: string }) {
  const { t } = await getServerTranslation({ locale })

  return (
    <div className="flex justify-center md:-mt-10">
      <div className="relative flex items-center justify-center gap-6 py-6 md:gap-8 md:py-10">
        <Marianne className="h-auto w-12 md:w-auto" />

        <div>
          <Ademe className="h-auto w-10 md:w-auto" />
        </div>

        <div>
          <Image
            priority
            src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/logo_abc_web_01c99cfe74.webp"
            alt={t(
              'common.partners.abc.ariaLabel',
              'Association pour la transition Bas Carbone'
            )}
            width="90"
            height="30"
            className="h-auto w-14"
          />
        </div>
      </div>
    </div>
  )
}
