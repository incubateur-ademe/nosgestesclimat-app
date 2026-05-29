export interface ComputedResult {
  carbone: MetricResult
  eau: MetricResult
}

export interface MetricResult {
  bilan: number
  categories: Record<string, number>
  subcategories?: Record<string, number>
}
