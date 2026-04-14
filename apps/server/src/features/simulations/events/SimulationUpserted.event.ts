import type {
  Group,
  Organisation,
  Poll,
  Simulation,
  User,
} from '../../../adapters/prisma/generated.js'
import { EventBusEvent } from '../../../core/event-bus/event.js'
import type { Locales } from '../../../core/i18n/constant.js'
import type { ModelToDto } from '../../../types/types.js'
import type { SimulationCreateQuery } from '../simulations.validator.js'

export type SimulationEvent = Pick<
  Simulation,
  | 'id'
  | 'progression'
  | 'actionChoices'
  | 'computedResults'
  | 'date'
  | 'situation'
>

export type SimulationAsyncEvent = SimulationEvent | ModelToDto<SimulationEvent>

type BaseSimulationUpsertedEventAttributes = {
  origin: string
  locale: Locales
  user: Pick<User, 'id' | 'name' | 'email'>
  simulation: SimulationEvent
  sendEmail: boolean
  created: boolean
  updated: boolean
  verified?: boolean
}

type SimulationAttributes = BaseSimulationUpsertedEventAttributes &
  (
    | {
        group?: undefined
        administrator?: undefined
        organisation?: undefined
        poll?: undefined
        newsletters: SimulationCreateQuery['newsletters']
      }
    | {
        group: Pick<Group, 'id' | 'name'>
        administrator: Pick<User, 'id'>
        organisation?: undefined
        poll?: undefined
        newsletters?: undefined
      }
    | {
        group?: undefined
        administrator?: undefined
        organisation: Pick<Organisation, 'name' | 'slug'>
        poll: Pick<Poll, 'slug'>
        newsletters?: undefined
      }
  )

export class SimulationUpsertedEvent extends EventBusEvent<SimulationAttributes> {
  name = 'SimulationUpsertedEvent'
}

export class SimulationUpsertedAsyncEvent extends EventBusEvent<
  SimulationAttributes | ModelToDto<SimulationAttributes>
> {
  name = 'SimulationUpsertedAsyncEvent'
}
