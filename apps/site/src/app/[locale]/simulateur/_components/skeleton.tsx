import ContentLarge from '@/components/layout/ContentLarge'

function SimulateurSkeleton() {
  return (
    <div className="flex flex-1 animate-pulse flex-col px-4 pt-16 pb-4 motion-reduce:animate-none md:pt-20">
      <ContentLarge>
        <div className="flex flex-1 flex-col gap-16 pt-8 md:flex-row">
          <div className="flex flex-1 flex-col">
            <div className="bg-primary-200 mb-4 h-8 w-32 rounded-sm"></div>

            <div className="space-y-6">
              <div className="bg-primary-200 h-12 rounded-sm"></div>
              <div className="bg-primary-200 h-24 rounded-sm"></div>
            </div>
          </div>
          <div className="hidden lg:block lg:w-[20rem]">
            <div className="bg-primary-200 h-80 rounded-sm"></div>
          </div>
        </div>
        <div className="absolute bottom-0 mt-auto flex justify-start gap-4 pb-4">
          <div className="bg-primary-200 h-10 w-32 rounded-sm"></div>
          <div className="bg-primary-200 h-10 w-32 rounded-sm"></div>
        </div>
      </ContentLarge>
    </div>
  )
}

export default SimulateurSkeleton
