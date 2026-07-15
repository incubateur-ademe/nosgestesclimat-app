import type { SimulationMode } from '@/helpers/server/model/simulations'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { POLL_DATA_KEY } from '../_constants/sessionStorage'

export interface PollDraft {
  name: string
  expectedNumberOfParticipants?: number
  mode?: SimulationMode
}

export interface CreatePollPayload extends PollDraft {
  mode: SimulationMode
}

function isValidDraft(data: unknown): data is PollDraft {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const draft = data as Record<string, unknown>

  if (typeof draft.name !== 'string' || draft.name.trim() === '') {
    return false
  }

  if (
    draft.expectedNumberOfParticipants !== undefined &&
    draft.expectedNumberOfParticipants !== null &&
    typeof draft.expectedNumberOfParticipants !== 'number'
  ) {
    return false
  }

  if (
    draft.mode !== undefined &&
    draft.mode !== 'standard' &&
    draft.mode !== 'scolaire'
  ) {
    return false
  }

  return true
}

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

export function writeDraft(data: PollDraft): void {
  safeSessionStorage.setItem(POLL_DATA_KEY, JSON.stringify(data))
}

export function clearDraft(): void {
  safeSessionStorage.removeItem(POLL_DATA_KEY)
}

export function buildCreatePollPayload(
  draft: PollDraft
): CreatePollPayload | null {
  if (!draft.mode) {
    return null
  }

  return {
    name: draft.name,
    expectedNumberOfParticipants:
      draft.expectedNumberOfParticipants ?? undefined,
    mode: draft.mode,
  }
}
