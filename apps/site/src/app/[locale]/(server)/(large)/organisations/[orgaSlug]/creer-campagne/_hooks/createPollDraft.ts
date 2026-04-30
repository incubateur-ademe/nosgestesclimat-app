import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { POLL_DATA_KEY } from '../_constants/sessionStorage'

export interface PollDraft {
  name: string
  expectedNumberOfParticipants?: number
}

export interface CreatePollPayload extends PollDraft {
  mode: 'standard' | 'scolaire'
}

/**
 * Validates if an object matches the PollDraft shape
 */
function isValidDraft(data: unknown): data is PollDraft {
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
export function readDraft(): PollDraft | null {
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
export function writeDraft(data: PollDraft): void {
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
  draft: PollDraft,
  mode: 'standard' | 'scolaire'
): CreatePollPayload {
  return {
    name: draft.name,
    expectedNumberOfParticipants:
      draft.expectedNumberOfParticipants || undefined,
    mode,
  }
}
