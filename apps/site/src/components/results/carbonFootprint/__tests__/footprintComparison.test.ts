import { describe, expect, it } from 'vitest'
import {
  getComparisonBarPercents,
  getFootprintComparison,
} from '../footprintComparison'

describe('getFootprintComparison', () => {
  it('is above the average when the footprint is strictly over 8 t', () => {
    expect(getFootprintComparison(14200)).toEqual({
      level: 'above',
      deltaKg: 6200,
    })
    expect(getFootprintComparison(8001).level).toBe('above')
    expect(getFootprintComparison(8100).level).toBe('above')
  })

  it('is close to the average from 7 t up to 8 t included', () => {
    expect(getFootprintComparison(8000)).toEqual({ level: 'close', deltaKg: 0 })
    expect(getFootprintComparison(7500).level).toBe('close')
    expect(getFootprintComparison(7000)).toEqual({
      level: 'close',
      deltaKg: -1000,
    })
  })

  it('is below the average strictly under 7 t', () => {
    expect(getFootprintComparison(6999).level).toBe('below')
    expect(getFootprintComparison(6900)).toEqual({
      level: 'below',
      deltaKg: -1100,
    })
    expect(getFootprintComparison(2000).level).toBe('below')
  })

  it('rounds the gap to a tenth of a tonne, like the displayed footprint', () => {
    // Close to 8 t the gap is displayed as nil, whatever the level
    expect(getFootprintComparison(8049)).toEqual({ level: 'above', deltaKg: 0 })
    expect(getFootprintComparison(7951)).toEqual({ level: 'close', deltaKg: 0 })
    expect(getFootprintComparison(8050)).toEqual({
      level: 'above',
      deltaKg: 100,
    })
  })
})

describe('getComparisonBarPercents', () => {
  it('fills the chart with the footprint when it is above the average', () => {
    expect(getComparisonBarPercents(16000)).toEqual({
      footprint: 100,
      average: 50,
      objective: 12.5,
    })
  })

  it('fills the chart with the average when the footprint is below it', () => {
    expect(getComparisonBarPercents(4000)).toEqual({
      footprint: 50,
      average: 100,
      objective: 25,
    })
    expect(getComparisonBarPercents(8000)).toEqual({
      footprint: 100,
      average: 100,
      objective: 25,
    })
  })

  it('keeps a tiny footprint visible', () => {
    expect(getComparisonBarPercents(200).footprint).toBe(8)
    expect(getComparisonBarPercents(0).footprint).toBe(8)
  })
})
