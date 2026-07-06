import supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json' with { type: 'json' }
import * as v from 'valibot'

const { ED: _, ...supportedRegionsWithoutED } = supportedRegions
export { supportedRegionsWithoutED as supportedRegions }

export type Region = keyof typeof supportedRegionsWithoutED

export const RegionSchema = v.picklist(
  Object.keys(supportedRegionsWithoutED) as Region[]
)

export const RegionDataSchema = v.object({
  current: RegionSchema,
  initial: RegionSchema,
})

export type RegionData = v.InferOutput<typeof RegionDataSchema>
