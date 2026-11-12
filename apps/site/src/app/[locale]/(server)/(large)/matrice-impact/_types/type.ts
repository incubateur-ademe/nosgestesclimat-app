export type ImpactCardType = 'usage' | 'impact' | 'efficiency'

export interface ImpactMatrixItem {
  id: string
  type: ImpactCardType
  title: React.ReactNode
  description: React.ReactNode
}
