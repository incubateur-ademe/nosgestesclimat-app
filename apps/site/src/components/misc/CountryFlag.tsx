import Image from 'next/image'

export default function CountryFlag({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  const flagSrc = `https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/${(code ===
  'UK'
    ? 'gb'
    : code
  ).toLowerCase()}.svg`

  return (
    <Image
      src={flagSrc}
      alt=""
      aria-hidden
      className={`mr-1 h-4 w-4 align-sub ${className}`}
      width={16}
      height={16}
    />
  )
}
