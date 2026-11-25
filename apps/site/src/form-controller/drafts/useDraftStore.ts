'use client'

import type { DottedName, NodeValue } from '@incubateur-ademe/nosgestesclimat'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'

/** A pending edit: the situation patch it will write, keyed by rule. */
export type Draft = Partial<Record<DottedName, NodeValue>>

/**
 * When an edit reaches the situation: after a delay, or on the next idle slot.
 */
type CommitTiming = number | 'idle'

const EMPTY_DRAFT: Draft = {}

interface PendingDraft {
  draft: Draft
  cancel: () => void
}

const schedule = (write: () => void, when: CommitTiming): (() => void) => {
  if (when === 'idle') {
    if (typeof requestIdleCallback === 'function') {
      // The timeout keeps a background tab from starving the commit.
      const idle = requestIdleCallback(write, { timeout: 1000 })
      return () => cancelIdleCallback(idle)
    }
    const timeout = setTimeout(write, 0)
    return () => clearTimeout(timeout)
  }
  const timeout = setTimeout(write, when)
  return () => clearTimeout(timeout)
}

/**
 * The draft container: the single mirror of pending edits, grouped by step. It
 * knows nothing about question types — a draft is a situation patch, and the
 * caller supplies the patch and when to write it.
 *
 * `commit` must be stable: a scheduled write uses the one captured when it was
 * staged.
 */
export function useDraftStore(
  commit: (step: DottedName, draft: Draft) => void
) {
  const [pending] = useState(() => new Map<DottedName, PendingDraft>())
  const [, rerender] = useReducer((count: number) => count + 1, 0)

  /** Write a step's pending patch now, cancelling its scheduled commit. */
  const flush = useCallback(
    (step: DottedName): boolean => {
      const entry = pending.get(step)
      if (!entry) return false
      entry.cancel()
      pending.delete(step)
      commit(step, entry.draft)
      rerender()
      return true
    },
    [pending, commit]
  )

  /** Merge a patch into the step's pending draft and (re)schedule its commit. */
  const stage = useCallback(
    (step: DottedName, draft: Draft, when: CommitTiming) => {
      const current = pending.get(step)
      current?.cancel()
      pending.set(step, {
        draft: { ...current?.draft, ...draft },
        cancel: schedule(() => flush(step), when),
      })
      rerender()
    },
    [pending, flush]
  )

  /** Drop every pending edit of a step, without committing them. */
  const discard = useCallback(
    (step: DottedName) => {
      const entry = pending.get(step)
      if (!entry) return
      entry.cancel()
      pending.delete(step)
      rerender()
    },
    [pending]
  )

  /** The step's pending edit, or an empty patch when nothing is staged. */
  const read = useCallback(
    (step: DottedName): Draft => pending.get(step)?.draft ?? EMPTY_DRAFT,
    [pending]
  )

  // Leaving the form with a pending edit would lose the last keystroke: the
  // timers live here, above the question that unmounts.
  useEffect(
    () => () => {
      pending.forEach((entry, step) => {
        entry.cancel()
        commit(step, entry.draft)
      })
    },
    [pending, commit]
  )

  return useMemo(
    () => ({ stage, read, flush, discard }),
    [stage, read, flush, discard]
  )
}

export type DraftStore = ReturnType<typeof useDraftStore>
