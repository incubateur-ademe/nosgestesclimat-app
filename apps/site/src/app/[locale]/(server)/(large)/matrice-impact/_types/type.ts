export type ImpactCardType = 'usage' | 'impact' | 'efficiency'

export interface ImpactMatrixItem {
  type: ImpactCardType
  title: React.ReactNode
  description: React.ReactNode
}
