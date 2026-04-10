import BlockSkeleton from '@/design-system/layout/BlockSkeleton'

export default function LoadingPage() {
  return (
    <>
      <div className="mb-12 flex justify-end">
        <BlockSkeleton className="mt-0 mb-0 h-7 w-72" />
      </div>
      <BlockSkeleton className="mt-0 h-36" />
    </>
  )
}
