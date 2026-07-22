import { getPersonalizedActionDetails as _getPersonalizedActionDetails } from '@nosgestesclimat/core/features/actions/services/get-personalized-action-details.service'
import { cache } from 'react'

export const getPersonalizedActionDetails = cache(_getPersonalizedActionDetails)
