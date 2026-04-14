import { twMerge } from 'tailwind-merge'

export default function DownArrow({
  className,
  ...props
}: {
  className?: string
}) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={twMerge('inline-block fill-white stroke-[1.5]', className)}
      aria-hidden="true"
      {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.9998 4.66663C14.6442 4.66663 15.1665 5.18896 15.1665 5.83329V19.35L21.3415 13.175C21.7972 12.7194 22.5359 12.7194 22.9915 13.175C23.4471 13.6306 23.4471 14.3693 22.9915 14.8249L14.8248 22.9916C14.3692 23.4472 13.6305 23.4472 13.1749 22.9916L5.00821 14.8249C4.5526 14.3693 4.5526 13.6306 5.00821 13.175C5.46382 12.7194 6.20252 12.7194 6.65813 13.175L12.8332 19.35V5.83329C12.8332 5.18896 13.3555 4.66663 13.9998 4.66663Z"
      />
    </svg>
  )
}
