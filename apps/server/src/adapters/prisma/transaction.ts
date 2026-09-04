import { type Transaction as Session } from '@nosgestesclimat/core/lib/transaction'
export {
  transaction,
  type Transaction as Session,
} from '@nosgestesclimat/core/lib/transaction'

export type RequestOptionsOrThrow = { session: Session; orThrow: true }
export type RequestOptionsOrNull = { session: Session; orThrow?: false }

export type RequestOptions = RequestOptionsOrNull | RequestOptionsOrThrow

export type FetchEntityResponse<
  T,
  Options extends RequestOptions,
> = Options extends RequestOptionsOrThrow ? Promise<T> : Promise<T | null>
