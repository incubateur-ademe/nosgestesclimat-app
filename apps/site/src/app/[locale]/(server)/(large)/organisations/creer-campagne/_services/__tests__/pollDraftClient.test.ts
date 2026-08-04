import { beforeEach, describe, expect, it } from 'vitest'
import { POLL_DATA_KEY } from '../../_constants/sessionStorage'
import {
  buildCreatePollPayload,
  clearDraft,
  readDraft,
  writeDraft,
} from '../pollDraftClient'

describe('pollDraftClient', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  describe('writeDraft / readDraft', () => {
    it('stores the draft in sessionStorage and reads it back', () => {
      const draft = {
        name: 'Défi climat équipe RH',
        expectedNumberOfParticipants: 42,
      }

      writeDraft(draft)

      expect(window.sessionStorage.getItem(POLL_DATA_KEY)).toBe(
        JSON.stringify(draft)
      )
      expect(readDraft()).toEqual(draft)
    })

    it('returns null when nothing is stored', () => {
      expect(readDraft()).toBeNull()
    })

    it('keeps a draft with only a name (mode not set yet)', () => {
      writeDraft({ name: 'Classe 5ème A' })

      expect(readDraft()).toEqual({ name: 'Classe 5ème A' })
    })
  })

  describe('readDraft validation', () => {
    it('clears the stored value and returns null when the name is missing', () => {
      window.sessionStorage.setItem(POLL_DATA_KEY, JSON.stringify({}))

      expect(readDraft()).toBeNull()
      expect(window.sessionStorage.getItem(POLL_DATA_KEY)).toBeNull()
    })

    it('clears the stored value and returns null when the name is empty', () => {
      window.sessionStorage.setItem(POLL_DATA_KEY, JSON.stringify({ name: '  ' }))

      expect(readDraft()).toBeNull()
      expect(window.sessionStorage.getItem(POLL_DATA_KEY)).toBeNull()
    })

    it('clears the stored value when the mode is invalid', () => {
      window.sessionStorage.setItem(
        POLL_DATA_KEY,
        JSON.stringify({ name: 'Mon test', mode: 'universitaire' })
      )

      expect(readDraft()).toBeNull()
      expect(window.sessionStorage.getItem(POLL_DATA_KEY)).toBeNull()
    })

    it('clears the stored value when expectedNumberOfParticipants is not a number', () => {
      window.sessionStorage.setItem(
        POLL_DATA_KEY,
        JSON.stringify({
          name: 'Mon test',
          expectedNumberOfParticipants: 'beaucoup',
        })
      )

      expect(readDraft()).toBeNull()
      expect(window.sessionStorage.getItem(POLL_DATA_KEY)).toBeNull()
    })

    it('clears the stored value when the JSON is malformed', () => {
      window.sessionStorage.setItem(POLL_DATA_KEY, 'not-json')

      expect(readDraft()).toBeNull()
      expect(window.sessionStorage.getItem(POLL_DATA_KEY)).toBeNull()
    })
  })

  describe('clearDraft', () => {
    it('removes the draft from sessionStorage', () => {
      writeDraft({ name: 'Mon test', mode: 'standard' })

      clearDraft()

      expect(window.sessionStorage.getItem(POLL_DATA_KEY)).toBeNull()
      expect(readDraft()).toBeNull()
    })
  })

  describe('buildCreatePollPayload', () => {
    it('returns null when the mode is not set', () => {
      expect(buildCreatePollPayload({ name: 'Mon test' })).toBeNull()
    })

    it('builds a payload with name, mode and expectedNumberOfParticipants', () => {
      const payload = buildCreatePollPayload({
        name: 'Mon test',
        mode: 'scolaire',
        expectedNumberOfParticipants: 30,
      })

      expect(payload).toEqual({
        name: 'Mon test',
        mode: 'scolaire',
        expectedNumberOfParticipants: 30,
      })
    })

    it('builds a payload without expectedNumberOfParticipants when absent', () => {
      const payload = buildCreatePollPayload({
        name: 'Mon test',
        mode: 'standard',
      })

      expect(payload).toEqual({
        name: 'Mon test',
        mode: 'standard',
        expectedNumberOfParticipants: undefined,
      })
    })
  })
})
