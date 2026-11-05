import { cn } from 'cn'
import type { ImpactMatrixItem } from '../_types/type'
import ImpactCardBadge from './impactCard/ImpactCardBadge'

export default function ImpactCard({
  type,
  title,
  description,
}: ImpactMatrixItem) {
  return (
    <li
      className={cn(
        'flex flex-col items-start',
        'rounded-md border border-slate-300 p-6 shadow-[2px_4px_0_0_var(--slate-200,#E2E8F0)]',
        'transition-all duration-500',
        'hover:-translate-y-1 hover:shadow-[2px_8px_0_0_var(--slate-200,#E2E8F0)]'
      )}>
      <h2 className="mb-6 font-bold">{title}</h2>

      <ImpactCardBadge className="-order-1" type={type} />

      <div>{description}</div>
    </li>
  )
}
