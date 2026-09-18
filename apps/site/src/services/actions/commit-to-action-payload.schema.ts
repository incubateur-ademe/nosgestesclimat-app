import * as v from 'valibot'

export const CommitToActionPayloadSchema = v.string()

export type CommitToActionPayload = v.InferOutput<
  typeof CommitToActionPayloadSchema
>
