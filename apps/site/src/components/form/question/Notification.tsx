'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import Markdown from '@/design-system/utils/Markdown'
import {
  getBgCategoryColor,
  getBorderCategoryColor,
  getTextCategoryColor,
} from '@/helpers/getCategoryColorClass'
import { useFormState, useRule } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { motion } from 'framer-motion'

interface Props {
  notification: DottedName
}

export default function Notification({ notification }: Props) {
  const { description, setValue } = useRule(notification)
  const { currentCategory } = useFormState()

  if (!notification || !description) return null

  return (
    <motion.div
      initial={{ opacity: 0, transform: 'translateY(10%)' }}
      animate={{ opacity: 1, transform: 'translateY(0)' }}
      transition={{ duration: 0.3 }}
      id="notification-message"
      className={`mb-4 flex flex-col items-end rounded-xl border-2 ${getBorderCategoryColor(currentCategory, '200')} ${getBgCategoryColor(currentCategory, '100')} !${getTextCategoryColor(currentCategory, '700')} p-4 text-sm`}>
      <div className="mb-2 w-full">
        <Markdown className="notification pb-0">{description}</Markdown>
      </div>
      <Button
        size="sm"
        color="secondary"
        data-testid="notification-button"
        onClick={() => setValue(false)}>
        <Trans>J'ai compris</Trans>
      </Button>
    </motion.div>
  )
}
