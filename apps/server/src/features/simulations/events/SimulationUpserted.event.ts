import type {
  Group,
  Simulation,
  User,
} from '../../../adapters/prisma/generated.ts'
import { EventBusEvent } from '../../../core/event-bus/event.ts'
import type { Locales } from '../../../core/i18n/constant.ts'
import type { ModelToDto } from '../../../types/types.ts'
import type { SimulationCreateQuery } from '../simulations.validator.ts'

export type SimulationEvent = Pick<
  Simulation,
  'id' | 'progression' | 'computedResults' | 'date' | 'situation'
>

export type SimulationAsyncEvent = SimulationEvent | ModelToDto<SimulationEvent>

type BaseSimulationUpsertedEventAttributes = {
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
        newsletters: SimulationCreateQuery['newsletters']
      }
    | {
        group: Pick<Group, 'id' | 'name'>
        administrator: Pick<User, 'id'>
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
