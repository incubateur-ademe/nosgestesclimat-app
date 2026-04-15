import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'

const POLL_DATA_KEY = 'poll_temp_form_data'

export interface CampaignDraft {
  name: string
  expectedNumberOfParticipants?: number
}

export interface CreatePollPayload {
  name: string
  expectedNumberOfParticipants?: number
  mode: 'standard' | 'scolaire'
}

/**
 * Validates if an object matches the CampaignDraft shape
 */
function isValidDraft(data: unknown): data is CampaignDraft {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const draft = data as Record<string, unknown>

  if (typeof draft.name !== 'string' || draft.name.trim() === '') {
    return false
  }

  // expectedNumberOfParticipants can be undefined, null (from JSON.stringify(NaN)), or a number
  if (
    draft.expectedNumberOfParticipants !== undefined &&
    draft.expectedNumberOfParticipants !== null &&
    typeof draft.expectedNumberOfParticipants !== 'number'
  ) {
    return false
  }

  return true
}

/**
 * Reads the campaign draft from session storage
 * Returns null if no draft exists or if it's invalid
 */
export function readDraft(): CampaignDraft | null {
  try {
    const raw = safeSessionStorage.getItem(POLL_DATA_KEY)

    if (!raw) {
      return null
    }

    const parsed: unknown = JSON.parse(raw)

    if (!isValidDraft(parsed)) {
      clearDraft()
      return null
    }

    return parsed
  } catch {
    clearDraft()
    return null
  }
}

/**
 * Writes the campaign draft to session storage
 */
export function writeDraft(data: CampaignDraft): void {
  safeSessionStorage.setItem(POLL_DATA_KEY, JSON.stringify(data))
}

/**
 * Clears the campaign draft from session storage
 */
export function clearDraft(): void {
  safeSessionStorage.removeItem(POLL_DATA_KEY)
}

/**
 * Builds the complete payload for creating a poll
 * Combines step 1 (draft) and step 2 (mode) data
 */
export function buildCreatePollPayload(
  draft: CampaignDraft,
  mode: 'standard' | 'scolaire'
): CreatePollPayload {
  return {
    name: draft.name,
    expectedNumberOfParticipants:
      draft.expectedNumberOfParticipants || undefined,
    mode,
  }
}
