import { ORGANISATION_URL } from '@/constants/urls/main'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'next/navigation'

export function useDeletePoll() {
  const { pollSlug, orgaSlug } = useParams()

  return useMutation({
    mutationKey: ['organisations', orgaSlug, 'polls', pollSlug],
    mutationFn: () =>
      axios
        .delete(`${ORGANISATION_URL}/${orgaSlug}/polls/${pollSlug}`, {
          withCredentials: true,
        })
        .then((res) => res.data),
  })
}
