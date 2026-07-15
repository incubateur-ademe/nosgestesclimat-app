'use client'

import ListIcon from '@/components/icons/ListIcon'
import LanguageSwitchButtonClient from '@/components/translation/LanguageSwitchButtonClient'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { useDebug } from '@/hooks/useDebug'

interface Props {
  toggleQuestionList: () => void
}

export default function TotalButtons({ toggleQuestionList }: Props) {
  const isDebug = useDebug()

  return (
    <div className="flex gap-2">
      <LanguageSwitchButtonClient />

      {isDebug && (
        <Button
          color="text"
          size="sm"
          className="h-10 w-10 p-0! font-medium lg:w-auto lg:gap-2 lg:px-4! lg:py-2!"
          onClick={() => {
            toggleQuestionList()
          }}>
          <ListIcon className="fill-primary-700 h-6 w-6" />
          <span className="hidden lg:inline">
            <Trans>Liste des questions</Trans>
          </span>
        </Button>
      )}
    </div>
  )
}
