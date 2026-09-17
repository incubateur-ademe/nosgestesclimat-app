import Image from 'next/image'

/**
 * Illustration shared by the error pages.
 *
 * `unoptimized`: the image must not depend on the Next optimizer
 * (`/_next/image`), unavailable when the app is down.
 */
export default function ErrorIllustration({ src }: { src: string }) {
  return (
    <Image src={src} width={280} height={280} alt="" priority unoptimized />
  )
}
