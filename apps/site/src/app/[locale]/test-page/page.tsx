'use client'

import { requestStorageAccess } from '@/helpers/iframe/storageAccess'

export default function Page() {
  return (
    <div>
      <button onClick={() => requestStorageAccess()}>
        Accorder les droits
      </button>
    </div>
  )
}
