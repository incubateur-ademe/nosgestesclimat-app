export type EventStatus = 'notStarted' | 'inProgress' | 'ended'
export type EventStatusWithoutNotStarted = Exclude<EventStatus, 'notStarted'>
