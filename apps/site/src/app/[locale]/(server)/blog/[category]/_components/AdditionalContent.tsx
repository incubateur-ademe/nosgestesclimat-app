import Image from 'next/image'

export default function AdditionalContent({
  content,
  image,
}: {
  content: string
  image: { url: string; alternativeText: string }
}) {
  return (
    <div className="flex flex-col justify-between gap-8 overflow-x-hidden md:flex-row">
      <div className="md:max-w-[30rem]">
        <p
          className="text-lg"
          dangerouslySetInnerHTML={{ __html: content ?? '' }}
        />
      </div>
      <div>
        <Image
          src={image?.url ?? ''}
          width="350"
          height="400"
          alt={image?.alternativeText ?? ''}
        />
      </div>
    </div>
  )
}
