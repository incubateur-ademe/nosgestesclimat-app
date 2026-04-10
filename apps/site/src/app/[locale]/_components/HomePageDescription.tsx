import Trans from '@/components/translation/trans/TransServer'

export default function HomePageDescription({ locale }: { locale: string }) {
  return (
    <p className="mb-0 text-base md:order-1 md:text-2xl">
      <Trans locale={locale}>
        <strong className="text-primary-700">
          Obtenez votre estimation personnalisée
        </strong>{' '}
        et des <strong className="text-secondary-700">pistes concrètes</strong>{' '}
        pour la réduire
      </Trans>
    </p>
  )
}
