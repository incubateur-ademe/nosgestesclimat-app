import Image from 'next/image'

export default function BlogHero({
  title,
  description,
  image,
}: {
  title: string
  description: string
  image: { url: string; alternativeText?: string }
}) {
  return (
    <div className="my-10 flex flex-col justify-between gap-8 overflow-x-hidden md:my-16 md:flex-row">
      <div className="bg-white md:max-w-[36rem]">
        <h1
          data-testid="blog-title"
          className="text-3xl md:text-5xl"
          dangerouslySetInnerHTML={{ __html: title ?? '' }}
        />

        <p
          className="text-lg"
          dangerouslySetInnerHTML={{ __html: description ?? '' }}
        />
      </div>
      {image && (
        <div className="flex flex-1 items-center justify-center">
          <Image
            src={image?.url ?? ''}
            width="350"
            height="400"
            className="w-44 md:w-auto"
            alt={image?.alternativeText ?? ''}
          />
        </div>
      )}
    </div>
  )
}
