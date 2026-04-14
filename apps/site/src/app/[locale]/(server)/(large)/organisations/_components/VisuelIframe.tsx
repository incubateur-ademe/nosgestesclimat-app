import Image from 'next/image'

export default function VisuelIframe() {
  return (
    <div
      className="relative mx-auto min-h-[15rem] w-2/3 md:min-h-[18rem]"
      aria-hidden="true"
      role="presentation">
      <div className="absolute -bottom-[8%] left-[-16%] flex w-full -rotate-[15deg] items-end rounded-t-md bg-white p-2 pb-0 shadow-md">
        <Image
          className="rounded-xs"
          src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_orga_visuel_3_2f5ec010f4.png"
          width="300"
          height="200"
          alt=""
          aria-hidden="true"
        />
      </div>

      <div className="absolute right-[-16%] -bottom-[8%] flex w-full rotate-[15deg] items-end rounded-t-md bg-white p-2 pb-0 shadow-md">
        <Image
          className="rounded-xs"
          src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_orga_visuel_3_2f5ec010f4.png"
          width="300"
          height="200"
          alt=""
          aria-hidden="true"
        />
      </div>

      <div className="absolute bottom-0 left-1/2 flex w-full -translate-x-1/2 items-end rounded-t-md bg-white p-2 pb-0 shadow-md">
        <Image
          className="rounded-xs"
          src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_orga_visuel_3_2f5ec010f4.png"
          width="260"
          height="200"
          alt=""
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
