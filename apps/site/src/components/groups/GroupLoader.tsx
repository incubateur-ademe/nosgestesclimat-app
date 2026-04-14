import Loader from '@/design-system/layout/Loader'

export default function GroupLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader className="border-gray-600 border-b-transparent" />
    </div>
  )
}
