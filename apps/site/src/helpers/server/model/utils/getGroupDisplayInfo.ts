import type { SimulationResultGroupInfo } from '@nosgestesclimat/core/features/simulations/services/get-simulation-result.service'

export interface GroupDisplayInfo {
  name: string
  href: string
}

export function getGroupDisplayInfo(
  group: SimulationResultGroupInfo
): GroupDisplayInfo {
  if (group.type === 'group') {
    return {
      name: group.value.name,
      href: `/amis/resultats?groupId=${group.value.id}`,
    }
  }

  return {
    name: group.value.name,
    href: `/organisations/${group.value.organisation.slug}/campagnes/${group.value.slug}`,
  }
}
