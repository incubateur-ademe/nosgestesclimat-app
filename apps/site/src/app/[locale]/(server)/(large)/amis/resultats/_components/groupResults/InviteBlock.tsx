'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import Emoji from '@/design-system/utils/Emoji'
import { getLocalizedPath } from '@/helpers/language/getLocalizedPath'
import { getLinkToGroupInvitation } from '@/helpers/navigation/groupPages'
import { useIsClient } from '@/hooks/useIsClient'
import { useLocale } from '@/hooks/useLocale'
import type { Group } from '@/types/groups'
import {
  UTM_MEDIUM_KEY,
  UTM_SOURCE_KEY,
} from '@nosgestesclimat/core/features/tracking/utm'
import { useEffect, useRef, useState } from 'react'

const SubmitButton = ({
  isShareDefined,
  handleShare,
  isCopied,
}: {
  isShareDefined: boolean
  handleShare: () => void
  isCopied: boolean
}) => {
  return (
    <Button
      className="flex justify-center whitespace-nowrap"
      onClick={() => {
        handleShare()
      }}
      data-testid="invite-button">
      {isShareDefined && <Trans>Partager</Trans>}
      {!isShareDefined &&
        (isCopied ? <Trans>Copié !</Trans> : <Trans>Copier le lien</Trans>)}
    </Button>
  )
}

export default function InviteBlock({ group }: { group: Group }) {
  const [isCopied, setIsCopied] = useState(false)

  const isClient = useIsClient()
  const locale = useLocale()

  const timeoutRef = useRef<NodeJS.Timeout>(undefined)

  // Only known after mount: resolving it during the first render would make the
  // server and client markup disagree, flipping the button label on hydration.
  const shouldUseShareAPI =
    isClient && 'share' in navigator && window.innerWidth <= 768

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Built on demand (in an event handler) so it never runs on the server.
  const getSharedURL = () =>
    `${window.location.origin}${getLocalizedPath(
      locale,
      getLinkToGroupInvitation({ group })
    )}&${UTM_MEDIUM_KEY}=sharelink&${UTM_SOURCE_KEY}=NGC`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getSharedURL())
    setIsCopied(true)
    timeoutRef.current = setTimeout(() => setIsCopied(false), 3000)
  }

  const handleShare = async () => {
    if (shouldUseShareAPI) {
      await navigator
        .share({
          url: getSharedURL(),
          title: 'Rejoindre mon groupe',
        })
        .catch(handleCopy)
    } else {
      await handleCopy()
    }
  }

  const hasMoreThanOneMember = group?.participants?.length > 1

  if (hasMoreThanOneMember) {
    return (
      <div className="mt-4 flex flex-col justify-between gap-4 rounded-md bg-gray-100 p-4 md:flex-row md:items-center">
        <p className="mb-0 text-sm md:text-base">
          <Trans>Invitez d'autres personnes à rejoindre votre groupe</Trans>
        </p>
        <SubmitButton
          isShareDefined={shouldUseShareAPI}
          isCopied={isCopied}
          handleShare={handleShare}
        />
      </div>
    )
  }

  return (
    <div className="rainbow-border mt-4 rounded-xl p-4">
      <h2 className="mt-0 flex items-center text-base md:text-lg">
        <Trans i18nKey="results.groups.invite.first">
          Vous êtes le premier <Emoji className="mx-1">🥳</Emoji> mais vous êtes
          seul·e… <Emoji>🥲</Emoji>
        </Trans>
      </h2>
      <p className="mb-4 text-sm md:text-base">
        <Trans>
          Partagez cette page à vos proches pour leur permettre de rejoindre
          votre groupe.
        </Trans>
      </p>
      <SubmitButton
        isShareDefined={shouldUseShareAPI}
        isCopied={isCopied}
        handleShare={handleShare}
      />
    </div>
  )
}
