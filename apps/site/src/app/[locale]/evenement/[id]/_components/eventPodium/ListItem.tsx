import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
import type { PodiumItem } from '../../_helpers/eventPageData'

interface Props extends PodiumItem {
  locale: Locale
}

export default function ListItem({ rank, label, score, locale }: Props) {
  return (
    <li className="border-primary-600 flex items-center gap-3 border-b px-6 py-4 last:border-b-0">
      <span className="w-10 text-slate-600">
        <span aria-hidden>#</span>
        {rank}
      </span>
      <span className="flex-1 pl-4 font-bold">{label}</span>

      <span>
        {score}{' '}
        <Trans locale={locale} i18nKey="event.podium.list.item.score">
          tests
        </Trans>
      </span>
    </li>
  )
}
