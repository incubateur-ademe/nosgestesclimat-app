import { getPublicActionsCatalogue as _getPublicActionsCatalogue } from '@nosgestesclimat/core/features/actions/services/get-public-actions-catalogue.service'
import { cache } from 'react'

export const getPublicActionsCatalogue = cache(_getPublicActionsCatalogue)
