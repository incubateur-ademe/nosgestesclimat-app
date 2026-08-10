import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import posthog from 'posthog-js'
import { APP_ENV } from '../../../config/app-env'

export const getTrackingKey = (...keys: string[]): string => {
  return `ngc_tracking_${keys.join('_')}`
}

export const getIsEventTracked = (...keys: string[]): boolean => {
  const key = getTrackingKey(...keys)
  return safeLocalStorage.getItem(key) === 'true'
}

export const markAsEventTracked = (...keys: string[]): void => {
  const key = getTrackingKey(...keys)
  safeLocalStorage.setItem(key, 'true')
}

export const captureUniqueSessionActionEvent = ({
  actionTrackingId,
  actionThemeTrackingId,
  co2PotentialInKg,
  eventName,
}: {
  actionTrackingId: string
  actionThemeTrackingId: string
  co2PotentialInKg?: number
  eventName: 'action displayed' | 'action consulted'
}) => {
  // We deduplicate all action events, only one is processed per session
  const sessionId =
    APP_ENV === 'development' ? 'dev_session_id' : posthog.get_session_id()

  const eventNameKey = eventName.replace(' ', '_')

  if (!getIsEventTracked(eventNameKey, actionTrackingId, sessionId)) {
    trackPosthogEvent({
      eventName,
      properties: {
        action_name: actionTrackingId,
        action_theme: actionThemeTrackingId,
        co2_potential_kg: co2PotentialInKg,
      },
    })

    markAsEventTracked(eventNameKey, actionTrackingId, sessionId)
  }
}
