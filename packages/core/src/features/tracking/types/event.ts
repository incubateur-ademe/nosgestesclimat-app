interface EventBase {
  name: string
  properties?: Record<string, unknown>
}

interface ActionRecommendedEvent extends EventBase {
  name: 'action recommended'
  properties: {
    /** Action trackingId */
    action_name: string
    /** Theme trackingId */
    action_theme: string
    co2_potential_kg?: number
  }
}

export type TrackingEvent = ActionRecommendedEvent
