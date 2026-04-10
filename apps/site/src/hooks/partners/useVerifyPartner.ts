import { verifyPartner } from '@/services/partners/verifyPartner'
import { useQuery } from '@tanstack/react-query'

export function useVerifyPartner(partner?: string): boolean | undefined {
  const { data } = useQuery({
    queryKey: ['verify-partner', partner],
    queryFn: async () => {
      if (!partner) return false

      return await verifyPartner(partner)
    },
  })

  return data
}
